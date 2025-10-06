import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare,
  Send,
  User,
  Bot,
  Loader2,
  AlertCircle,
  Database,
  Code,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Table,
  ExternalLink
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  sql?: string;
  results?: any[];
}

export const GenieChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI-powered Wind Fleet Assistant. I can help you analyze turbine data, predict maintenance needs, and provide insights about your fleet. What would you like to know?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSqlFor, setShowSqlFor] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleSqlVisibility = (messageId: string) => {
    setShowSqlFor(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/genie/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: userMessage.content,
          conversation_id: conversationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Debug logging
      console.log('Genie response:', data);
      if (data.query_results) {
        console.log('Query results:', data.query_results);
      }

      // Update conversation ID if this is the first message
      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: data.message_id || Date.now().toString(),
        content: data.content,
        sender: 'assistant',
        timestamp: new Date(data.timestamp),
        sql: data.sql_query,
        results: data.query_results
      };

      setMessages(prev => [
        ...prev.slice(0, -1),
        { ...userMessage, status: 'sent' },
        assistantMessage
      ]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      setMessages(prev => [
        ...prev.slice(0, -1),
        { ...userMessage, status: 'error' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "What's the average energy output from my turbines?",
    "How many turbines are in my fleet?",
    "Explain the dataset for me",
    "Rank the turbines based on the standard deviation of sensor A in descending order"
  ];

  const openGenieSpace = () => {
    // The Genie space ID from environment
    const genieSpaceId = '01f0a2c551c715039b5e2d87da3f0890';
    const databricksHost = 'https://one-env-nam-nguyen-workspace-classic.cloud.databricks.com';
    const genieUrl = `${databricksHost}/genie/rooms/${genieSpaceId}`;
    window.open(genieUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-lg border border-gray-200">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Genie AI Assistant</h3>
            <p className="text-xs text-gray-500">Powered by Databricks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={conversationId ? "default" : "secondary"}>
            {conversationId ? 'Connected' : 'New Session'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={openGenieSpace}
            className="flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            Open Full Genie
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 max-w-[80%]`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user'
                  ? 'bg-blue-100 ml-2'
                  : 'bg-purple-100 mr-2'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-5 h-5 text-blue-600" />
                ) : (
                  <Bot className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <div className="space-y-2">
                <div className={`rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.status === 'sending' && (
                    <Loader2 className="w-3 h-3 animate-spin mt-1" />
                  )}
                  {message.status === 'error' && (
                    <AlertCircle className="w-3 h-3 text-red-400 mt-1" />
                  )}
                </div>

                {/* Show SQL query toggle button if available */}
                {message.sql && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleSqlVisibility(message.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      {showSqlFor.has(message.id) ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      <Code className="w-3 h-3" />
                      <span>View SQL Query</span>
                    </button>

                    {/* Show SQL query if expanded */}
                    {showSqlFor.has(message.id) && (
                      <div className="mt-2 bg-gray-900 text-gray-100 rounded-lg p-3">
                        <pre className="text-xs overflow-x-auto">
                          <code>{message.sql}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Show query results as formatted table */}
                {message.results && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b">
                      <Table className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-gray-700">Query Results</span>
                      {message.results.row_count !== undefined && (
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {message.results.row_count} row{message.results.row_count !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    {/* Check if results have the new structured format */}
                    {message.results.columns && message.results.data ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr className="border-b">
                              {message.results.columns.map((col: string, idx: number) => (
                                <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  {col}
                                  {message.results.column_types && message.results.column_types[idx] && (
                                    <span className="ml-1 text-gray-400 font-normal lowercase">
                                      ({message.results.column_types[idx]})
                                    </span>
                                  )}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {message.results.data.slice(0, 10).map((row: any[], rowIdx: number) => (
                              <tr key={rowIdx} className="hover:bg-gray-50">
                                {row.map((value: any, colIdx: number) => (
                                  <td key={colIdx} className="px-3 py-2 text-sm text-gray-900">
                                    {value !== null && value !== undefined && value !== "" ? (
                                      // Try to parse as number for better formatting
                                      !isNaN(parseFloat(value)) && !Number.isInteger(parseFloat(value)) ?
                                        parseFloat(value).toFixed(4) :
                                        value.toString()
                                    ) : (
                                      <span className="text-gray-400 italic">null</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {message.results.data.length > 10 && (
                          <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-500 text-center">
                            Showing first 10 rows of {message.results.row_count} total
                          </div>
                        )}
                      </div>
                    ) : (
                      // Fallback for old format (if any)
                      <div className="p-3 text-xs text-gray-600">
                        <pre>{JSON.stringify(message.results, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-xs text-gray-400">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span className="text-sm text-gray-600">Genie is thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInput(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your turbine fleet..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send • Powered by Databricks Genie
        </p>
      </div>
    </div>
  );
};