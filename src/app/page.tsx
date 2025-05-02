'use client';

import { useState } from 'react';

type PredictionResult = {
	label: string;
	confidence: number;
};

export default function Home() {
	const [text, setText] = useState('');
	const [result, setResult] = useState<PredictionResult[]>([]);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ text }),
			});

			const data = await res.json();
			if (res.ok) {
				setResult(data.data);
			} else {
				alert(data.message);
			}
		} catch {
			alert('Gagal memanggil backend API');
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className='flex flex-col m-auto content-center gap-2 w-2xl items-center justify-center p-4'>
			<h1 className='text-xl mb-4 font-bold'>Coba sini aku tebak penyakit kamu melalui gejala</h1>
			<textarea
				className='w-full p-2 border mb-2 rounded'
				rows={4}
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder='Masukkan gejala untuk prediksi...'
			/>
			<button
				onClick={handleSubmit}
				className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
				disabled={loading}
			>
				{loading ? 'Memproses...' : 'Prediksi'}
			</button>

			{result.length > 0 && (
				<div className='mt-4'>
					<h2 className='text-lg font-semibold mb-2'>Hasil Prediksi Sicantik:</h2>
					<ul className='list-disc list-inside'>
						{result.map((item, index) => (
							<li key={index}>
								<span className='font-medium'>{item.label}</span> — {Math.round(item.confidence * 100)}%
							</li>
						))}
					</ul>
				</div>
			)}
		</main>
	);
}
