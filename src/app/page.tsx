'use client';

import { useState } from 'react';

type PredictionResult = {
	label: string;
	deskripsi: string;
};

export default function Home() {
	const [text, setText] = useState('');
	const [result, setResult] = useState<PredictionResult[]>([]);
	const [predictedDisease, setPredictedDisease] = useState<string | null>(null);
	const [obatResult, setObatResult] = useState<PredictionResult[]>([]);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		if (text.trim().split(/\s+/).length < 5) {
			alert('Masukkan minimal 5 kata gejala, ya!');
			return;
		}

		setLoading(true);
		setResult([]);
		setPredictedDisease(null);
		setObatResult([]);

		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/penyakit`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ text }),
			});

			const data = await res.json();
			if (res.ok) {
				const predictions = data.data;
				setResult(
					predictions.map((item: any) => ({
						label: item.penyakit,
						deskripsi: item.deskripsi,
					}))
				);
				if (predictions.length > 0) {
					setPredictedDisease(predictions[0].penyakit);
				}
			} else {
				alert(data.message ?? 'Terjadi kesalahan saat memproses.');
			}
		} catch {
			alert('Gagal memanggil backend API.');
		} finally {
			setLoading(false);
		}
	};

	const handlePredictObat = async () => {
		if (!predictedDisease) {
			alert('Belum ada hasil prediksi penyakit.');
			return;
		}

		try {
			setLoading(true);
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/obat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					gejala: text,
					penyakit: predictedDisease,
				}),
			});

			const data = await res.json();

			if (res.ok) {
				setObatResult(
					data.data.map((item: any) => ({
						label: item.obat,
						deskripsi: item.deskripsi,
					}))
				);
			} else {
				alert(data.message ?? 'Terjadi kesalahan saat memprediksi obat.');
			}
		} catch {
			alert('Gagal memanggil API prediksi obat.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<main
			className='min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center'
			style={{ backgroundImage: "url('/background.png')" }}
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
						<h2 className='text-lg font-semibold mb-2 text-gray-800'>Hasil Prediksi Penyakit:</h2>
						<ul className='list-disc list-inside text-gray-700 space-y-2'>
							{result.map((item, index) => (
								<li key={index}>
									<span className='font-medium'>{item.label}</span>
									<p className='text-sm text-gray-600'>{item.deskripsi}</p>
								</li>
							))}
						</ul>
					</div>
				)}

				{predictedDisease && (
					<div className='mt-4 text-center'>
						<p className='text-sm text-gray-600 mb-2'>
							Penyakit terprediksi: <strong>{predictedDisease}</strong>
						</p>
						<button
							onClick={handlePredictObat}
							disabled={loading}
							className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50'
						>
							{loading ? 'Memproses Obat...' : 'Prediksi Obat'}
						</button>
					</div>
				)}

				{obatResult.length > 0 && (
					<div className='mt-6'>
						<h2 className='text-lg font-semibold mb-2 text-green-800'>Rekomendasi Obat:</h2>
						<ul className='list-disc list-inside text-green-700 space-y-2'>
							{obatResult.map((item, index) => (
								<li key={index}>
									<span className='font-medium'>{item.label}</span>
									<p className='text-sm text-green-600'>{item.deskripsi}</p>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</main>
	);
}
