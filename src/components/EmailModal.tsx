import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h2`
  margin: 0 0 1.5rem;
  color: #333;
  font-size: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    border-color: #0078d7;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 2px rgba(0, 120, 215, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  outline: none;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    border-color: #0078d7;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 2px rgba(0, 120, 215, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$primary ? 'rgba(88, 92, 95, 0.9)' : 'rgba(240, 240, 240, 0.9)'};
  color: ${props => props.$primary ? 'white' : '#333'};
  backdrop-filter: blur(5px);

  &:hover {
    background: ${props => props.$primary ? 'rgba(88, 92, 95, 0.9)' : 'rgba(224, 224, 224, 0.95)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem;
  border-radius: 4px;
`;

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !message) {
      setError('请填写所有必填字段');
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    try {
      setSending(true);
      
      // 检查环境变量是否正确加载
      if (!import.meta.env.VITE_EMAILJS_SERVICE_ID ||
          !import.meta.env.VITE_EMAILJS_TEMPLATE_ID ||
          !import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
        throw new Error('EmailJS配置未正确加载，请检查环境变量');
      }

      console.log('开始发送邮件...');
      console.log('发件人邮箱:', email);
      console.log('留言内容:', message);
      
      // 检查表单数据
      if (formRef.current) {
        const formData = new FormData(formRef.current);
        console.log('表单数据:', {
          user_email: formData.get('user_email'),
          message: formData.get('message')
        });
      }
      
      // 发送邮件
      const result = await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current!,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      console.log('发送结果:', result);

      if (result.text === 'OK') {
        onClose();
        alert('邮件发送成功！');
      } else {
        throw new Error('发送失败');
      }
    } catch (err) {
      console.error('发送邮件时出错:', err);
      setError(err instanceof Error ? err.message : '发送失败，请稍后重试');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContainer
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <Title>Contact Me</Title>
            <Form ref={formRef} onSubmit={handleSubmit}>
              <Input
                type="email"
                name="user_email"
                placeholder="From: Your Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={sending}
              />
              <TextArea
                name="message"
                placeholder="Write your message here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                disabled={sending}
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <ButtonGroup>
                <Button type="button" onClick={onClose} disabled={sending}>
                  Cancel
                </Button>
                <Button type="submit" $primary disabled={sending}>
                  {sending ? 'Sending...' : 'Send'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default EmailModal;