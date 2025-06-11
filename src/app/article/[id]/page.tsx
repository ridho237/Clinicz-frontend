'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type ArticleDetail = {
	id: string;
	title: string;
	date: string;
	content: string;
	img: string;
	tag: string[];
	doctor: {
		name: string;
		sources: string;
	};
	source: string;
	url: string;
};

export default function ArticleDetailPage() {
	const router = useRouter();
	const { id } = useParams<{ id: string }>();
	const [article, setArticle] = useState<ArticleDetail | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;

		const fetchArticle = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/article/${id}`);
				const data = await res.json();
				setArticle(data);
			} catch (error) {
				console.error('Gagal memuat artikel:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchArticle();
	}, [id]);

	if (loading) return <p>Memuat artikel...</p>;
	if (!article) return <p>Artikel tidak ditemukan.</p>;

	return (
		<div className='p-6 max-w-4xl mx-auto bg-white shadow-md rounded-xl mt-10'>
			{/* Gambar utama */}
			{article.img && (
				<img
					src={article.img}
					alt={article.title}
					className='w-full h-60 object-cover rounded-lg mb-4'
				/>
			)}

			{/* Judul */}
			<h1 className='text-3xl font-bold mb-2'>{article.title}</h1>

			{/* Tanggal dan nama dokter */}
			<p className='text-sm text-gray-500 mb-4'>
				{article.date}
				{article.doctor?.name && ` | Oleh ${article.doctor.name}`}
			</p>

			{/* Konten artikel */}
			<div
				className='prose'
				dangerouslySetInnerHTML={{ __html: article.content }}
			/>

			{/* Tag */}
			{article.tag.length > 0 && (
				<div className='flex flex-wrap gap-2 mb-6'>
					{article.tag.map((t, idx) => (
						<span
							key={idx}
							className='bg-gray-200 text-gray-700 px-3 py-1 text-sm rounded-full'
						>
							#{t}
						</span>
					))}
				</div>
			)}

			{/* Sumber dari dokter */}
			{article.doctor?.sources && (
				<>
					<h3 className='text-lg font-semibold mb-2'>Sumber Referensi Dokter:</h3>
					<div
						className='prose text-sm text-gray-600 mb-6'
						dangerouslySetInnerHTML={{ __html: article.doctor.sources }}
					/>
				</>
			)}

			{/* Sumber asli artikel */}
			<p className='text-sm text-gray-600 mt-6'>
				Sumber:{' '}
				<a
					href={article.url}
					target='_blank'
					rel='noopener noreferrer'
					className='text-blue-600 underline'
				>
					{article.source}
				</a>
			</p>

			{/* Tombol kembali */}
			<div className='mt-8'>
				<button
					onClick={() => router.back()}
					className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
				>
					Kembali
				</button>
			</div>
		</div>
	);
}
