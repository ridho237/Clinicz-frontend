'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';

type PredictionResult = {
	label: string;
	deskripsi: string;
};

type PredictionItem = {
	penyakit: string;
	deskripsi: string;
};

type ObatItem = {
	obat: string;
	deskripsi: string;
};

type RekomendasiItem = {
	obat: string;
	kandungan: string;
	similarity: number;
};

type ChatMessage = {
	role: 'user' | 'model';
	text: string;
};

export default function Home() {
	const [text, setText] = useState('');
	const [result, setResult] = useState<PredictionResult[]>([]);
	const [predictedDisease, setPredictedDisease] = useState<string | null>(null);
	const [obatResult, setObatResult] = useState<PredictionResult[]>([]);
	const [rekomendasiObat, setRekomendasiObat] = useState<RekomendasiItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [chatInput, setChatInput] = useState('');
	const [loadingChat, setLoadingChat] = useState(false);

	const handleSubmit = async () => {
		if (text.trim().split(/\s+/).length < 5) {
			alert('Masukkan minimal 5 kata gejala, ya!');
			return;
		}

		setLoading(true);
		setResult([]);
		setPredictedDisease(null);
		setObatResult([]);
		setRekomendasiObat([]);

		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict/penyakit`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text }),
			});
			const data = await res.json();
			console.log('Hasil prediksi penyakit:', data);
			if (res.ok) {
				const predictions: PredictionItem[] = data.data;
				setResult(
					predictions.map((item) => ({
						label: item.penyakit,
						deskripsi: item.deskripsi,
					}))
				);
				if (predictions.length > 0) {
					setPredictedDisease(predictions[0].penyakit);
					console.log('Predicted disease diset:', predictions[0].penyakit);
				}
			} else {
				alert(data.message ?? 'Terjadi kesalahan.');
			}
		} catch (error) {
			console.error('Error prediksi penyakit:', error);
			alert('Gagal memanggil backend.');
		} finally {
			setLoading(false);
		}
	};

	const handlePredictObat = async () => {
		console.log('Menjalankan handlePredictObat dengan predictedDisease:', predictedDisease);
		if (!predictedDisease) {
			alert('Belum ada hasil prediksi penyakit.');
			return;
		}

		setLoading(true);
		setObatResult([]);
		setRekomendasiObat([]);

		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict/obat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ gejala: text, penyakit: predictedDisease }),
			});
			const data = await res.json();
			console.log('Hasil prediksi obat:', data);
			if (res.ok) {
				const obatItems: ObatItem[] = data.data;
				setObatResult(
					obatItems.map((item) => ({
						label: item.obat,
						deskripsi: item.deskripsi,
					}))
				);
				console.log('Obat result diset:', obatItems);
			} else {
				alert(data.message ?? 'Terjadi kesalahan saat prediksi obat.');
			}
		} catch (error) {
			console.error('Error prediksi obat:', error);
			alert('Gagal memanggil backend.');
		} finally {
			setLoading(false);
		}
	};

	const handleRekomendasiObat = async () => {
		console.log('Menjalankan handleRekomendasiObat dengan predictedDisease:', predictedDisease);
		if (!predictedDisease) {
			alert('Belum ada hasil prediksi penyakit.');
			return;
		}

		const obatUtama = obatResult.length > 0 ? obatResult[0].label : null;
		console.log('Obat utama untuk rekomendasi:', obatUtama);
		if (!obatUtama) {
			alert('Tidak ada obat yang bisa direkomendasikan.');
			return;
		}

		setLoading(true);
		setRekomendasiObat([]);

		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict/rekomendasi-obat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ obat: obatUtama, penyakit: predictedDisease }),
			});
			const data = await res.json();
			console.log('Hasil rekomendasi obat:', data);
			if (res.ok) {
				setRekomendasiObat(data.data);
			} else {
				alert(data.message ?? 'Terjadi kesalahan saat rekomendasi.');
			}
		} catch (error) {
			console.error('Error rekomendasi obat:', error);
			alert('Gagal memanggil backend.');
		} finally {
			setLoading(false);
		}
	};

	const handleChatSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!chatInput.trim()) return;

		const newMessage: ChatMessage = {
			role: 'user',
			text: chatInput.trim(),
		};

		setChatMessages((prev) => [...prev, newMessage]);
		setChatInput('');
		setLoadingChat(true);

		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: newMessage.text }),
			});

			const data = await res.json();
			const reply = data.reply || 'Gemini tidak membalas.';
			setChatMessages((prev) => [...prev, { role: 'model', text: reply }]);
		} catch (err) {
			console.error(err);
			setChatMessages((prev) => [...prev, { role: 'model', text: 'Terjadi kesalahan.' }]);
		} finally {
			setLoadingChat(false);
		}
	};

	return (
		<main
			className='min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center'
			style={{ backgroundImage: "url('/background.png')" }}
		>
			<div className='mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Kiri: prediksi */}
				<div className='bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl backdrop-blur-sm bg-opacity-90'>
					<h1 className='text-3xl font-extrabold text-center text-gray-900 mb-3'>Coba Aku Tebak Penyakitmu!</h1>
					<p className='text-center text-gray-600 mb-6'>Tulis minimal 5 gejala ya</p>
					<textarea
						className='w-full p-4 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition mb-4'
						rows={5}
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder='Contoh: demam, batuk, pilek, sakit kepala, lemas...'
					/>

					<button
						onClick={handleSubmit}
						disabled={loading}
						className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{loading ? 'Memproses...' : ' Prediksi Sekarang'}
					</button>

					{result.length > 0 && (
						<div className='mt-8'>
							<h2 className='text-xl font-bold mb-3 text-gray-800'>Hasil Prediksi Penyakit:</h2>
							<ul className='space-y-4'>
								{result.map((item) => (
									<li
										key={item.label}
										className='bg-gray-100 p-4 rounded-lg shadow-inner border border-gray-200'
									>
										<p className='font-semibold text-gray-800'>{item.label}</p>
										<p className='text-sm text-gray-600 mt-1'>{item.deskripsi}</p>
									</li>
								))}
							</ul>
						</div>
					)}

					{predictedDisease && (
						<div className='mt-6 text-center'>
							<div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
								<button
									onClick={handlePredictObat}
									disabled={loading}
									className='bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50'
								>
									{loading ? 'Memproses Obat...' : 'Prediksi Obat'}
								</button>
								<button
									onClick={handleRekomendasiObat}
									disabled={loading}
									className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50'
								>
									{loading ? 'Memproses Rekomendasi...' : 'Rekomendasi Obat Lain'}
								</button>
							</div>
						</div>
					)}

					{obatResult.length > 0 && (
						<div className='mt-8'>
							<h2 className='text-xl font-bold mb-3 text-green-800'>Rekomendasi Obat:</h2>
							<ul className='space-y-4'>
								{obatResult.map((item) => (
									<li
										key={item.label}
										className='bg-green-50 p-4 rounded-lg shadow-inner border border-green-200'
									>
										<p className='font-semibold text-green-800'>{item.label}</p>
										<p className='text-sm text-green-600 mt-1'>{item.deskripsi}</p>
									</li>
								))}
							</ul>
						</div>
					)}

					{rekomendasiObat.length > 0 && (
						<div className='mt-8'>
							<h2 className='text-xl font-bold mb-4 text-blue-800'>Rekomendasi Obat Lainnya:</h2>
							<div className='flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-300'>
								{rekomendasiObat.map((item) => (
									<div
										key={item.obat}
										className='min-w-[200px] bg-blue-50 p-4 rounded-xl shadow-md border border-blue-200 flex-shrink-0'
									>
										<h3 className='text-lg font-semibold text-blue-800'>{item.obat}</h3>
										<p className='text-sm text-blue-600 mt-1'>{item.kandungan}</p>
										<p className='text-xs text-blue-500 mt-2'>Similarity: {(item.similarity * 100).toFixed(1)}%</p>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
				{/* Panel Chatbot Gemini */}
				<div className='bg-white p-6 rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col'>
					<h2 className='text-2xl font-extrabold mb-4 text-purple-700 flex items-center gap-2'>
						<Bot className='w-6 h-6 text-purple-500' />
						Gemini Assistant
					</h2>

					{/* Chat Bubble List */}
					<div className='flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-purple-300 mb-4 max-h-[400px]'>
						{chatMessages.map((msg, i) => (
							<div
								key={i}
								className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
							>
								{msg.role === 'model' && (
									<div className='flex-shrink-0 bg-purple-100 p-2 rounded-full'>
										<Bot className='w-4 h-4 text-purple-600' />
									</div>
								)}
								<div
									className={`p-3 rounded-2xl shadow-md max-w-xs transition ${
										msg.role === 'user'
											? 'bg-indigo-100 text-right text-indigo-900 ml-auto'
											: 'bg-gray-100 text-left text-gray-800'
									}`}
								>
									<ReactMarkdown>{msg.text}</ReactMarkdown>
								</div>
								{msg.role === 'user' && (
									<div className='flex-shrink-0 bg-indigo-100 p-2 rounded-full'>
										<User className='w-4 h-4 text-indigo-600' />
									</div>
								)}
							</div>
						))}
					</div>

					{/* Form Chat Input */}
					<form
						onSubmit={handleChatSubmit}
						className='flex gap-2 mt-auto'
					>
						<input
							type='text'
							className='flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm'
							placeholder='Tanya sesuatu...'
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
						/>
						<button
							type='submit'
							disabled={loadingChat}
							className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition disabled:opacity-50'
						>
							{loadingChat ? '...' : 'Kirim'}
						</button>
					</form>
				</div>
			</div>
		</main>
	);
}
