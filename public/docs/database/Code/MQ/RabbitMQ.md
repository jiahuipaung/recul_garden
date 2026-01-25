# 开发指南
## 关键概念区分
- **Producer（生产者）**：消息的发送者。
- **Consumer（消费者）**：消息的接收者。
- **Queue（队列）**：存储消息的容器。
- **Exchange（交换机）**：将消息路由到一个或多个队列。
- **Binding（绑定）**：定义了交换机与队列之间的关系。

## 导入
```
amqp "github.com/rabbitmq/amqp091-go"
```
## 连接
这里通常封装成一个broker包，通过viper读取配置
```go
func Connect(user, password, host, port string) (*amqp.Channel, func() error) {  
    address := fmt.Sprintf("amqp://%s:%s@%s:%s/", user, password, host, port)  
	//连接到rabbitmq
    conn, err := amqp.Dial(address)  
    if err != nil {  
       logrus.Fatalf("failed to connect to RabbitMQ: %s", err)  
    }  
    // 创建通道
    ch, err := conn.Channel()  
    if err != nil {  
       logrus.Fatalf("failed to open a channel: %s", err)  
    }  
    err = ch.ExchangeDeclare(EventOrderCreate, "direct", true, false, false, false, nil)  
    if err != nil {  
       logrus.Fatalf("failed to declare EventOrderCreate: %s", err)  
    }  
    err = ch.ExchangeDeclare(EventOrderPaid, "fanout", true, false, false, false, nil)  
    if err != nil {  
       logrus.Fatalf("failed to declare EventOrderPaid: %s", err)  
    }  
    if err = createDLX(ch); err != nil {  
       logrus.Fatalf("failed to create DLX: %s", err)  
    }  
    return ch, conn.Close  
}
```
