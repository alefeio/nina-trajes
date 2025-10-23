import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaChevronLeft, FaChevronRight, FaWhatsapp, FaShareAlt, FaHeart, FaGlobe } from "react-icons/fa";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PrismaClient } from '@prisma/client';
import { MenuItem, Pacote } from '../../../types';
import { richTextToHtml } from '../../../utils/richTextToHtml';
import Link from 'next/link';
import { MenuInterno as MenuComponent } from 'components/MenuInterno';
import Footer from 'components/Footer';

const prisma = new PrismaClient();

interface PacotePageProps {
  pacote: Pacote;
  menu: MenuItem | null;
}

const isImage = (url: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

export default function PacotePage({ pacote, menu }: PacotePageProps) {
  const router = useRouter();
  const scrollContainer = useRef<HTMLDivElement>(null);
  const canShare = typeof window !== 'undefined' && 'share' in navigator;

  const [currentLikes, setCurrentLikes] = useState(pacote.like || 0);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const shareUrl = `${baseUrl}${router.asPath}`;

  // Registra visualização
  useEffect(() => {
    const registerView = async () => {
      try {
        await fetch('/api/stats/item-view', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pacoteId: pacote.id }),
        });
      } catch (error) {
        console.error('Erro ao registrar visualização:', error);
      }
    };
    registerView();
  }, [pacote.id]);

  if (router.isFallback) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  const currentMedia = pacote.fotos[0];

  const scroll = (offset: number) => {
    if (scrollContainer.current) scrollContainer.current.scrollLeft += offset;
  };

  const handleLike = useCallback(async () => {
    setCurrentLikes(prev => prev + 1);
    try {
      await fetch('/api/stats/pacote-like', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacoteId: pacote.id }),
      });
    } catch {
      setCurrentLikes(prev => prev - 1);
    }
  }, [pacote.id]);

  const handleShare = useCallback(async () => {
    if (canShare) {
      try {
        await navigator.share({
          title: pacote.title,
          text: pacote.subtitle || "Confira este pacote!",
          url: shareUrl,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copiado!');
    }
  }, [canShare, pacote.title, pacote.subtitle, shareUrl]);

  const handleWhatsApp = useCallback(() => {
    const whatsappNumber = "5591981149800";
    const message = encodeURIComponent(
      `Olá, tenho interesse no pacote "${pacote.title}" (${shareUrl}). Pode me dar mais informações?`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  }, [pacote.title, shareUrl]);

  const metaDescription = pacote.subtitle
    ? pacote.subtitle
    : `Descubra o pacote ${pacote.title} com a Romaria Fluvial Muiraquitã.`;

  return (
    <>
      <Head>
        <title>{pacote.title} | Romaria Fluvial Muiraquitã</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={pacote.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={shareUrl} />
        {currentMedia && <meta property="og:image" content={currentMedia.url} />}
      </Head>

      <div className="container mx-auto px-4">
        <MenuComponent menuData={menu} />
        <div className="bg-white pt-32 shadow-lg overflow-hidden">
          <div className="relative my-6">
            {pacote.fotos.length > 1 && (
              <div className="absolute top-1/2 left-0 right-0 z-10 flex justify-between px-4 -translate-y-1/2">
                <button onClick={() => scroll(-400)} className="p-2 bg-white rounded-full shadow-lg">
                  <FaChevronLeft />
                </button>
                <button onClick={() => scroll(400)} className="p-2 bg-white rounded-full shadow-lg">
                  <FaChevronRight />
                </button>
              </div>
            )}
            <div ref={scrollContainer} className="flex gap-4 overflow-x-scroll scrollbar-hide px-4">
              {pacote.fotos.map((item, index) => (
                <div key={index} className="relative min-w-[80vw] h-[400px] rounded-lg overflow-hidden shadow-md">
                  {isImage(item.url) ? (
                    <Image
                      src={item.url}
                      alt={`${pacote.title} - Mídia ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <video src={item.url} className="w-full h-full object-cover" controls />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-orange-500 mb-2">{pacote.title}</h1>
            {pacote.subtitle && <p className="text-lg text-neutral-600 mb-4">{pacote.subtitle}</p>}

            <div className="flex items-center gap-4 my-4 flex-wrap">
              <button onClick={handleLike} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full">
                <FaHeart /> <span>{currentLikes}</span>
              </button>
              <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full">
                <FaShareAlt /> Compartilhar
              </button>
              <button onClick={handleWhatsApp} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full">
                <FaWhatsapp /> WhatsApp
              </button>
              <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-full">
                <FaGlobe /> Site
              </Link>
            </div>

            <div className="mt-8 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2 uppercase">Detalhes do Pacote:</h3>
              <div
                className="prose max-w-none text-neutral-700"
                dangerouslySetInnerHTML={{ __html: richTextToHtml(pacote.description) }}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer menuData={menu} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pacotes = await prisma.pacote.findMany({
    select: {
      slug: true,
      destino: { select: { id: true } },
    },
  });

  const paths = pacotes.map(p => ({
    params: { destinoId: `norte-${p.destino.id}`, pacoteSlug: p.slug },
  }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { destinoId, pacoteSlug } = params as { destinoId: string; pacoteSlug: string };

  const destinoIdReal = destinoId.split('-')[1];

  const pacote = await prisma.pacote.findUnique({
    where: { slug: pacoteSlug },
    include: { fotos: true },
  });

  if (!pacote) return { notFound: true };

  const menu = await prisma.menu.findFirst();

  const serializedPacote = {
    ...pacote,
    createdAt: pacote.createdAt?.toISOString() || null,
    updatedAt: pacote.updatedAt?.toISOString() || null,
    fotos: pacote.fotos.map(f => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    })),
  };

  return { props: { pacote: serializedPacote, menu }, revalidate: 60 };
};
