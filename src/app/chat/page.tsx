"use client";

import { useEffect, useState } from "react";
import { socket } from "../../socket";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [message, setMessage] = useState("");
  const [targetId, setTargetId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setTransport("N/A");
    };

    const handleReceivedMessage = (msg: string) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("receive-message", handleReceivedMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("receive-message", handleReceivedMessage);
    };
  }, []);

  const joinRoom = (e: any) => {
    e.preventDefault();
    if (roomName.trim()) {
      socket.emit("join-room", roomName.trim());
      setMessages((prevMessages) => [...prevMessages, `Joined room: ${roomName}`]);
      setRoomName("")
    }
  };

  const sendMessage = (e: any) => {
    e.preventDefault();
    if (!message.trim()) return;

    const payload: any = { msg: message.trim() };
    if (targetId.trim()) payload.targetId = targetId.trim();
    else if (roomName.trim()) payload.room = roomName.trim();

    socket.emit("message", payload);
    setMessages((prevMessages) => [...prevMessages, `You: ${message}`]);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
        <h1 className="text-xl font-bold mb-4">Socket.IO Chat</h1>
        <p className="mb-2">
          <span className="font-semibold">Status:</span>{" "}
          <span className={isConnected ? "text-green-600" : "text-red-600"}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </p>
        <p className="mb-4">
          <span className="font-semibold">Transport:</span> {transport}
        </p>
        <p className="mb-4">
          <span className="font-semibold">Socket.IO ID:</span> {socket.id}
        </p>

        <div className="mb-4">
          <div className="max-h-[250px] h-[250px] overflow-y-auto border rounded-md p-2 bg-gray-50">
            {messages.map((msg, index) => (
              <p key={index} className="text-sm text-gray-800">
                {msg}
              </p>
            ))}
          </div>
        </div>

        <form className="flex flex-col space-y-2" onSubmit={joinRoom}>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Join a room..."
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
          >
            Join Room
          </button>
        </form>

        <form className="flex flex-col space-y-2 mt-4" onSubmit={sendMessage}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type a message..."
          />
          <input
            type="text"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Target User ID (optional)..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
