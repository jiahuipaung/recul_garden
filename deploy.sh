#!/bin/bash

# 构建项目
echo "Building project..."
npm run build

# 压缩dist目录
echo "Compressing dist directory..."
tar -czf dist.tar.gz dist/

# 上传到服务器
echo "Uploading to server..."
scp dist.tar.gz ubuntu@www.recul.xyz:~/

# SSH到服务器执行部署
echo "Deploying on server..."
ssh ubuntu@www.recul.xyz << 'ENDSSH'
    cd ~/
    sudo mv ~/dist.tar.gz /var/www/html/
    sudo rm -rf /var/www/html/dist/
    sudo tar -xzf /var/www/html/dist.tar.gz -C /var/www/html/
    sudo rm /var/www/html/dist.tar.gz
    
    # 确保图片目录存在并有正确的权限
    sudo mkdir -p /var/www/html/dist/assets/photos
    sudo chown -R www-data:www-data /var/www/html/dist
    sudo chmod -R 755 /var/www/html/dist
    
    # 配置 Nginx
    echo "Configuring Nginx..."
    sudo bash -c 'cat > /etc/nginx/sites-available/recul.xyz << EOL
server {
    listen 80;
    server_name www.recul.xyz recul.xyz;

    root /var/www/html/dist;
    index index.html;

    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 1000;

    # 客户端缓存设置
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # 视频文件缓存设置
    location ~* \.(mp4|webm|ogg)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
        add_header Accept-Ranges bytes;
        access_log off;
    }

    # 处理单页应用路由
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # 安全相关配置
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # 禁止访问 . 开头的隐藏文件
    location ~ /\\. {
        deny all;
    }

    # 错误页面配置
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;

    # 开启 sendfile
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
}
EOL'

    # 创建符号链接
    sudo ln -sf /etc/nginx/sites-available/recul.xyz /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default

    # 测试并重启 Nginx
    sudo nginx -t && sudo systemctl restart nginx
ENDSSH

# 清理本地文件
echo "Cleaning up local files..."
rm -f dist.tar.gz

echo "Deployment completed!" 