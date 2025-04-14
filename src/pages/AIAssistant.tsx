import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant = () => {
  return (
    <div>
      <h1>AI Assistant</h1>
    </div>
  );
};

export default AIAssistant; 