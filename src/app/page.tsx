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
		if (text.trim().split(/\s+/).length < 5) {
			alert('Masukkan minimal 5 kata gejala, ya!');
			return;
		}

		setLoading(true);
		setResult([]);

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
				alert(data.message || 'Terjadi kesalahan saat memproses.');
			}
		} catch {
			alert('Gagal memanggil backend API.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<main
			className='min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center'
			style={{
				backgroundImage: "url('/background.png')",
			}}
		>
			<div className='bg-white p-6 rounded-2xl shadow-xl w-full max-w-xl'>
				<h1 className='text-2xl text-black font-bold text-center mb-2'>Coba Aku Tebak Penyakitmu Lewat Gejala</h1>
				<p className='text-center text-black p-2'>Minimal 5 gejala ya ^_^</p>

				<textarea
					className='w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4'
					rows={4}
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder='Contoh: demam, batuk, pilek, sakit kepala, lemas...'
				/>

				<button
					onClick={handleSubmit}
					disabled={loading}
					className='w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg font-semibold disabled:opacity-50'
				>
					{loading ? 'Memproses...' : 'Prediksi Sekarang'}
				</button>

				{result.length > 0 && (
					<div className='mt-6'>
						<h2 className='text-lg font-semibold mb-2 text-gray-800'>Hasil Prediksi:</h2>
						<ul className='list-disc list-inside text-gray-700 space-y-1'>
							{result.map((item, index) => (
								<li key={index}>
									<span className='font-medium'>{item.label}</span> — {Math.round(item.confidence * 100)}%
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</main>
	);
}
