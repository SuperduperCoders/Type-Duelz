
// Solo mode page moved to /dashboard

'use client';

import { useEffect, useState, useRef } from 'react';
import { useErrorAudio } from "../../hooks/useErrorAudio";
import Image from 'next/image';
import dynamic from 'next/dynamic';

const NamePicker = dynamic(() => import('../components/NamePicker'), { ssr: false });

const sentenceBank = {
  easy: [
    "Hi there.",
    "I like cats.",
    "Fast fox.",
    "Hello world.",
    "Nice job!"
  ],
  medium: [
    "The quick brown fox jumps over the lazy dog.",
    "Typing fast is a useful skill.",
    "Tailwind CSS is awesome.",
    "I love coding fun projects.",
    "Next.js makes building web apps easier."
  ],
  hard: [
    "JavaScript developers often face asynchronous challenges.",
    "Efficiency in algorithms can greatly affect performance.",
    "Next.js integrates both frontend and backend logic seamlessly.",
    "Performance optimization is vital for user experience.",
    "Complexity in state management can hinder scalability."
  ]
};

const wpmGoals = {
  easy: 20,
  medium: 40,
  hard: 60,
};

export default function Home() {
  // ...existing code from cleaned-up page.tsx...
}
