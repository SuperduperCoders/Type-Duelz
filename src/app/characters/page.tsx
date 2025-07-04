'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const characters = [
	{
		id: 'default-typer',
		name: 'Default Typer',
		cost: { duelPoints: 10, skillPoints: 20 },
		ownedKey: 'char_default_typer',
		ability: 'Skipper',
		image: '/computer.png', // Fixed: removed /public
	},
	{
		id: 'pro',
		name: 'Good Typer',
		cost: { duelPoints: 30, skillPoints: 50 },
		ownedKey: 'char_pro',
		ability: 'In Duel Mode, has a 50% chance to get a shorter sentence!',
		image: '/GoodTyper.png', // Fixed: removed /public
	},
	{
		id: 'pro-wihich',
		name: 'Pro Typer',
		cost: { duelPoints: 60, skillPoints: 100 },
		ownedKey: 'char_pro_wihich',
		ability: `When pressing Enter, makes the whole screen red then skips three whole words (usable once per sentence).`,
		image: '/Pro.png',
	},
	{
		id: 'advanced-typer',
		name: 'Advanced Typer',
		cost: { duelPoints: 100, skillPoints: 200 },
		ownedKey: 'char_advanced_typer',
		ability: `Sabatoge`,
		image: '/Advanced.png', // Fixed: removed /public
	},
	{
		id: 'master',
		name: 'Master',
		cost: { duelPoints: 200, skillPoints: 400 },
		ownedKey: 'char_master',
		ability: `Murder`,
		image: '/Master.Png', // Fixed: removed /public
	},
	{
		id: '????',
		name: '?????',
		cost: { duelPoints: 350, skillPoints: 350 },
		ownedKey: 'char_master',
		ability: `UNkwON`,
		image: '/unkown.Png', // Fixed: removed /public
	},
];

export default function CharactersPage() {
	const [duelPoints, setDuelPoints] = useState(0);
	const [skill, setSkill] = useState(0);
	const [owned, setOwned] = useState<{ [key: string]: boolean }>({});
	const [equipped, setEquipped] = useState<string | null>(null);
	const [sabotageCooldown, setSabotageCooldown] = useState(0);
	const [killCooldown, setKillCooldown] = useState(0);
	const [mounted, setMounted] = useState(false);
	const clickAudioRef = useRef<HTMLAudioElement | null>(null);

	// On mount, initialize all state from localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			setMounted(true);
			setDuelPoints(parseInt(localStorage.getItem('duelPoints') || '0', 10));
			setSkill(parseInt(localStorage.getItem('typingSkill') || '0', 10));
			const newOwned: { [key: string]: boolean } = {};
			characters.forEach(c => {
				newOwned[c.ownedKey] = !!localStorage.getItem(c.ownedKey);
			});
			setOwned(newOwned);
			setEquipped(localStorage.getItem('equippedCharacter'));
			setSabotageCooldown(parseInt(localStorage.getItem('sabotageCooldown') || '0', 10));
			setKillCooldown(parseInt(localStorage.getItem('killCooldown') || '0', 10));
		}
	}, []);

	// Poll sabotageCooldown only if mounted, equipped, and owned
	useEffect(() => {
		let interval: NodeJS.Timeout | undefined;
		if (
			mounted &&
			typeof window !== 'undefined' &&
			owned['char_advanced_typer'] &&
			equipped === 'advanced-typer'
		) {
			interval = setInterval(() => {
				const cooldown = parseInt(localStorage.getItem('sabotageCooldown') || '0', 10);
				setSabotageCooldown(cooldown);
			}, 1000);
		}
		return () => interval && clearInterval(interval!);
	}, [mounted, equipped, owned['char_advanced_typer']]);

	// Poll killCooldown if equipped and owned
	useEffect(() => {
		let interval: NodeJS.Timeout | undefined;
		if (
			mounted &&
			typeof window !== 'undefined' &&
			owned['char_master'] &&
			equipped === 'master'
		) {
			interval = setInterval(() => {
				const cooldown = parseInt(localStorage.getItem('killCooldown') || '0', 10);
				setKillCooldown(cooldown);
			}, 1000);
		}
		return () => interval && clearInterval(interval!);
	}, [mounted, equipped, owned['char_master']]);

	const handleBuyWithDuel = (char: typeof characters[0]) => {
		if (owned[char.ownedKey]) return;
		if (duelPoints >= char.cost.duelPoints) {
			const newDuel = duelPoints - char.cost.duelPoints;
			localStorage.setItem('duelPoints', newDuel.toString());
			localStorage.setItem(char.ownedKey, '1');
			setDuelPoints(newDuel);
			setOwned(prev => ({ ...prev, [char.ownedKey]: true }));
			// Save all relevant data
			localStorage.setItem('ownedCharacters', JSON.stringify({ ...owned, [char.ownedKey]: true }));
			// Auto-equip after buying
			localStorage.setItem('equippedCharacter', char.id);
			setEquipped(char.id);
		} else {
			alert('Not enough Duel Points!');
		}
	};

	const handleBuyWithSkill = (char: typeof characters[0]) => {
		if (owned[char.ownedKey]) return;
		if (skill >= char.cost.skillPoints) {
			const newSkill = skill - char.cost.skillPoints;
			localStorage.setItem('typingSkill', newSkill.toString());
			localStorage.setItem(char.ownedKey, '1');
			setSkill(newSkill);
			setOwned(prev => ({ ...prev, [char.ownedKey]: true }));
			// Save all relevant data
			localStorage.setItem('ownedCharacters', JSON.stringify({ ...owned, [char.ownedKey]: true }));
			// Auto-equip after buying
			localStorage.setItem('equippedCharacter', char.id);
			setEquipped(char.id);
		} else {
			alert('Not enough Skill Points!');
		}
	};

	const handleEquip = (char: typeof characters[0]) => {
		if (!owned[char.ownedKey]) return;
		localStorage.setItem('equippedCharacter', char.id);
		setEquipped(char.id);
	};

	const playClick = () => {
		if (clickAudioRef.current) {
			clickAudioRef.current.currentTime = 0;
			clickAudioRef.current.play();
		}
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-white to-slate-100 dark:from-black dark:to-gray-900 p-6 flex flex-col items-center">
			<audio ref={clickAudioRef} src="/click.mp3" preload="auto" />
			<h1 className="text-3xl font-bold mb-6">🦸 Characters</h1>
			<div className="mb-4 flex gap-4">
				<span className="bg-blue-200 text-blue-800 px-3 py-1 rounded">Duel Points: {duelPoints}</span>
				<span className="bg-green-200 text-green-800 px-3 py-1 rounded">Skill: {skill}</span>
			</div>
			{owned['char_advanced_typer'] && equipped === 'advanced-typer' && (
				<div className="mb-4 text-lg text-red-700 dark:text-red-300 font-semibold">
					Sabotage Cooldown: {sabotageCooldown === 0 ? 'Ready!' : sabotageCooldown + ' duel' + (sabotageCooldown > 1 ? 's' : '')}
				</div>
			)}
			{owned['char_master'] && equipped === 'master' && (
				<div className="mb-4 text-lg text-red-700 dark:text-red-300 font-semibold">
					Kill Cooldown: {killCooldown === 0 ? 'Ready!' : killCooldown + ' duel' + (killCooldown > 1 ? 's' : '')}
				</div>
			)}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
				{characters.map(char => (
					<div key={char.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-200 dark:border-gray-700">
						<img src={char.image} alt={char.name} className="w-20 h-20 mb-4" />
						<h2 className="text-xl font-bold mb-2">{char.name}</h2>
						<p className="mb-2 text-gray-700 dark:text-gray-300 text-center">{char.ability}</p>
						<div className="mb-2 text-sm text-gray-500">Cost: <span className="font-semibold">{char.cost.duelPoints} Duel Points</span> or <span className="font-semibold">{char.cost.skillPoints} Skill</span></div>
						{owned[char.ownedKey] ? (
							<>
								{equipped === char.id ? (
									<span className="bg-green-600 text-white px-4 py-2 rounded font-semibold">Equipped</span>
								) : (
									<button
										className="bg-purple-500 text-white px-4 py-2 rounded font-semibold hover:bg-purple-600 transition mb-2"
										onClick={() => { playClick(); handleEquip(char); }}
									>
										Equip
									</button>
								)}
								<span className="bg-green-500 text-white px-4 py-2 rounded font-semibold">Owned</span>
							</>
						) : (
							<div className="flex flex-col gap-2 w-full">
								<button
									className="bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 transition"
									onClick={() => { playClick(); handleBuyWithDuel(char); }}
								>
									Buy with Duel Points
								</button>
								<button
									className="bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-600 transition"
									onClick={() => { playClick(); handleBuyWithSkill(char); }}
								>
									Buy with Skill Points
								</button>
							</div>
						)}
					</div>
				))}
			</div>
			<Link href="/" className="mt-8 text-blue-600 hover:underline" onClick={playClick}>← Back to Home</Link>
		</main>
	);
}
