/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MusicPlayer } from './components/MusicPlayer';
import { SnakeGame } from './components/SnakeGame';
import { Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono relative overflow-hidden flex flex-col">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full p-6 flex items-center justify-center border-b border-white/5 bg-black/40 backdrop-blur-md z-10"
      >
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_10px_rgba(217,70,239,0.4)]">
            NEON SNAKE // SYNTHWAVE
          </h1>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 p-6 z-10 w-full max-w-7xl mx-auto">
        
        {/* Left side: Music Player */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full lg:w-1/3 flex justify-center lg:justify-end order-2 lg:order-1"
        >
          <MusicPlayer />
        </motion.div>

        {/* Center/Right side: Game */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full lg:w-2/3 flex justify-center lg:justify-start order-1 lg:order-2"
        >
          <SnakeGame />
        </motion.div>

      </main>
    </div>
  );
}
