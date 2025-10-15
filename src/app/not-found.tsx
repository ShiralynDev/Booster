'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search,  Zap } from 'lucide-react';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            duration: 1 
          }}
          className="relative mb-8"
        >
          <h1 className="text-9xl font-bold">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              404
            </span>
          </h1>
          
          {/* Floating sun particles */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-80 shadow-lg"
          />
          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute -bottom-2 -left-4 w-6 h-6 bg-orange-400 rounded-full opacity-80 shadow-lg"
          />
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
            This page does not exist. Check the URL or go back to the homepage.
          </p>
        </motion.div>

        {/* Animated Sun Illustration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mb-12"
        >
          <div className="relative w-64 h-48 mx-auto">
            {/* Main Sun */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full shadow-2xl flex items-center justify-center">
                <div className="w-16 h-16 bg-amber-300 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-amber-600" />
                </div>
              </div>
            </motion.div>
            
            {/* Sun Rays */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="absolute w-4 h-16 bg-gradient-to-b from-yellow-300 to-amber-400 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-60px)`,
                  transformOrigin: 'center bottom'
                }}
              />
            ))}
            
            {/* Floating Orbs */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -30, 0],
                  x: [0, 20, 0],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  delay: i * 0.8
                }}
                className="absolute w-6 h-6 bg-gradient-to-r from-amber-300 to-orange-400 rounded-full shadow-lg"
                style={{
                  top: `${20 + i * 20}%`,
                  left: `${10 + i * 25}%`,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-500 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 shadow-lg hover:shadow-yellow-500/30 transition-all duration-300"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Back to Home
            </motion.button>
          </Link>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="group border-2 border-amber-300 text-amber-700 px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 hover:bg-amber-50 hover:border-amber-400 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </motion.button>
        </motion.div>

        {/* Search Suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 max-w-md mx-auto shadow-lg"
        >
          <div className="flex items-center gap-3 text-amber-700 mb-3">
            <Search className="w-5 h-5" />
            <span className="font-medium">Lost?</span>
          </div>
          <p className="text-amber-600 text-sm">
            Try using the search function.
          </p>
        </motion.div>

     
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.6, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full shadow-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
        
        {/* Large floating orbs */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -50, 0],
              x: [0, 30, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 2,
            }}
            className="absolute w-12 h-12 bg-gradient-to-r from-yellow-200 to-amber-300 rounded-full opacity-40 blur-sm"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 25}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
