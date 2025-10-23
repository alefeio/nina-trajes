import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaChevronLeft, FaChevronRight, FaWhatsapp, FaShareAlt, FaHeart, FaGlobe } from "react-icons/fa";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PrismaClient } from '@prisma/client';
// ATENÇÃO: Certifique-se de que a interface Pacote em '../../../types' não inclui mais o campo 'dates'.
import { MenuItem, Pacote } from '../../../types'; 
import { richTextToHtml } from '../../../utils/richTextToHtml';
import Link from 'next/link';
import { MenuInterno as MenuComponent } from 'components/MenuInterno';
import Footer from 'components/Footer';

const prisma = new PrismaClient();

// Interface ajustada para tipagem
interface PacotePageProps {
    pacote: Pacote;
    // Usando 'any' para evitar o erro de tipagem no Menu, como ajustado anteriormente
    menu: any | null; 
}

const isImage = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

export default function PacotePage({ pacote, menu }: PacotePageProps) {
    const router = useRouter();
    const scrollContainer = useRef<HTMLDivElement>(null);
    const canShare = typeof window !== 'undefined' && 'share' in navigator;

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [currentLikes, setCurrentLikes] = useState(pacote.like || 0);
    
    // ATUALIZADO: Número de WhatsApp da Nina Trajes
    const whatsappNumber = "5591983169340"; 
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ninatrajes.com.br';
    const shareUrl = `${baseUrl}${router.asPath}`;

    // --- RASTREAMENTO DE VISUALIZAÇÃO ---
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

    // --- FUNÇÕES DE SCROLL E DRAGGING ---
    const scroll = (scrollOffset: number) => {
        if (scrollContainer.current) {
            scrollContainer.current.scrollLeft += scrollOffset;
        }
    };

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (scrollContainer.current) {
            setIsDragging(true);
            setStartX(e.pageX - scrollContainer.current.offsetLeft);
            setScrollLeft(scrollContainer.current.scrollLeft);
            scrollContainer.current.style.cursor = 'grabbing';
            scrollContainer.current.style.userSelect = 'none';
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !scrollContainer.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.current.offsetLeft;
        const walk = (x - startX);
        scrollContainer.current.scrollLeft = scrollLeft - walk;
    }, [isDragging, startX, scrollLeft]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if (scrollContainer.current) {
            scrollContainer.current.style.cursor = 'grab';
            scrollContainer.current.style.userSelect = 'auto';
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            if (scrollContainer.current) {
                scrollContainer.current.style.cursor = 'grab';
                scrollContainer.current.style.userSelect = 'auto';
            }
        }
    }, [isDragging]);

    useEffect(() => {
        if (scrollContainer.current) {
            scrollContainer.current.style.cursor = 'grab';
        }
    }, []);
    // --- FIM SCROLL/DRAGGING ---

    // --- FUNÇÕES DE AÇÃO ---
    const handleLike = useCallback(async () => {
        const liked = localStorage.getItem(`pacote-${pacote.id}-liked`);
        if (liked) return;

        setCurrentLikes(prev => prev + 1);
        try {
            const response = await fetch('/api/stats/pacote-like', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pacoteId: pacote.id }),
            });
            if (!response.ok) setCurrentLikes(prev => prev - 1);
            else localStorage.setItem(`pacote-${pacote.id}-liked`, 'true');
        } catch {
            setCurrentLikes(prev => prev - 1);
        }
    }, [pacote.id]);

    const handleShare = useCallback(async () => {
        if (canShare) {
            try {
                await navigator.share({
                    title: pacote.title,
                    text: pacote.subtitle || "Confira este vestido!", // ATUALIZADO
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
        const message = encodeURIComponent(
            // ATUALIZADO: Mensagem para Nina Trajes
            `Olá, tenho interesse no vestido "${pacote.title}" (${shareUrl}). Pode me dar mais informações sobre aluguel e disponibilidade?`
        );
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    }, [pacote.title, shareUrl, whatsappNumber]);
    // --- FIM FUNÇÕES DE AÇÃO ---

    // --- METATAGS SEO COMPLETO (ATUALIZADO PARA NINA TRAJES) ---
    const companyName = "Nina Trajes";
    const metaDescription = pacote.subtitle
        ? pacote.subtitle
        : `Alugue o vestido ${pacote.title} com a ${companyName}. Perfeito para sua festa ou formatura.`;

    const keywords = `${pacote.title}, vestido de festa, aluguel de vestido, ${pacote.subtitle || ''}, ${companyName}, vestidos Belém, vestidos Barcarena, ${pacote.slug}`
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0)
        .join(', ');

    const mediaUrl = currentMedia?.url || 'https://res.cloudinary.com/dibplswe5/image/upload/v1761082142/dresses/tlljoqsjare2zxii5otp.jpg';
    const isCurrentMediaImage = currentMedia ? isImage(currentMedia.url) : true;
    // --- FIM METATAGS SEO COMPLETO ---

    return (
        <>
            <Head>
                {/* TÍTULO ATUALIZADO */}
                <title>{pacote.title} | {companyName}: Aluguel de Vestidos de Festa</title>
                
                <meta name="description" content={metaDescription} />
                <meta name="keywords" content={keywords} />
                <link rel="canonical" href={shareUrl} />
                <meta name="robots" content="index, follow" />
                <meta property="og:locale" content="pt_BR" />
                {/* SITE NAME ATUALIZADO */}
                <meta property="og:site_name" content={companyName} />
                <meta property="og:title" content={pacote.title} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:url" content={shareUrl} />
                <meta property="og:type" content="article" />
                
                {/* OG Image / Video Tags */}
                {isCurrentMediaImage ? (
                    <meta property="og:image" content={mediaUrl} />
                ) : (
                    <>
                        <meta property="og:image" content={mediaUrl.replace(/\.(mp4|mov|avi|webm)$/i, '.jpg')} />
                        <meta property="og:video" content={mediaUrl} />
                        <meta property="og:video:type" content="video/mp4" />
                    </>
                )}
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pacote.title} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={mediaUrl} />
                
                {/* Schema Markup (ATUALIZADO DE TravelAgency para Product) */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": pacote.title,
                        "description": metaDescription,
                        "image": mediaUrl,
                        "url": shareUrl,
                        "brand": {
                            "@type": "Brand",
                            "name": companyName
                        },
                        "offers": {
                            "@type": "Offer",
                            "priceCurrency": "BRL",
                            "price": "0.00", // Preço placeholder, contato para valor real
                            "itemCondition": "https://schema.org/UsedCondition", // Aluguel
                            "availability": "https://schema.org/Inquire" , 
                            "seller": {
                                "@type": "LocalBusiness", // ATUALIZADO
                                "name": companyName
                            }
                        }
                    })
                }} />
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
                        <div 
                            ref={scrollContainer} 
                            className="flex gap-4 overflow-x-scroll scrollbar-hide snap-x snap-mandatory px-4 md:px-0"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseLeave}
                        >
                            {pacote.fotos.map((item, index) => (
                                <div key={index} className="relative min-w-[80vw] h-[400px] sm:min-w-[60vw] md:min-w-[50vw] lg:min-w-[40vw] xl:min-w-[30vw] snap-center rounded-lg overflow-hidden shadow-md flex-shrink-0">
                                    {isImage(item.url) ? (
                                        <Image
                                            src={item.url}
                                            alt={`${pacote.title} - Mídia ${index + 1}`}
                                            layout="fill"
                                            objectFit="cover"
                                            priority={index === 0}
                                        />
                                    ) : (
                                        <video 
                                            src={item.url} 
                                            className="w-full h-full object-cover" 
                                            controls 
                                            playsInline 
                                            preload="metadata"
                                        />
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
                            {/* TEXTO DE RESERVA ATUALIZADO */}
                            <h3 className="text-lg font-semibold mb-2 uppercase">Informações de Aluguel e Prova:</h3>
                            <p className="text-base text-neutral-500 mb-4">Entre em contato via WhatsApp para confirmar a disponibilidade deste modelo e agendar sua prova delivery em Belém ou Barcarena.</p>
                            <a
                                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá, tenho interesse no vestido "${pacote.title}" (${shareUrl}). Gostaria de verificar a disponibilidade para aluguel.`)}`}
                                onClick={handleWhatsApp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center justify-center gap-2 text-white bg-green-600 hover:bg-green-700 font-bold py-3 px-6 rounded-full transition-colors shadow-lg"
                            >
                                <FaWhatsapp size={20} className='text-white' /> Falar com {companyName}
                            </a>
                        </div>
                        
                        <div className="mt-8 border-t pt-4">
                            <h3 className="text-lg font-semibold mb-2 uppercase">Detalhes do Modelo:</h3>
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

// -----------------------------------------------------------------------------
// GET STATIC PATHS
// -----------------------------------------------------------------------------
export const getStaticPaths: GetStaticPaths = async () => {
    const pacotes = await prisma.pacote.findMany({
        select: {
            slug: true,
            destino: { select: { id: true } },
        },
    });

    const paths = pacotes.map(p => ({
        // Mantém a estrutura 'norte-ID' para compatibilidade de rota
        params: { destinoId: `norte-${p.destino.id}`, pacoteSlug: p.slug }, 
    }));

    return { paths, fallback: 'blocking' };
};

// -----------------------------------------------------------------------------
// GET STATIC PROPS (SERIALIZAÇÃO CORRIGIDA)
// -----------------------------------------------------------------------------
export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { pacoteSlug } = params as { destinoId: string; pacoteSlug: string };

    // 1. Busca o Pacote
    const pacote = await prisma.pacote.findUnique({
        where: { slug: pacoteSlug },
        include: { fotos: true },
    });

    if (!pacote) return { notFound: true };

    // 2. Busca o Menu
    const menuDB = await prisma.menu.findFirst();

    // 3. Serializa o Pacote de forma segura
    const serializedPacote = {
        ...pacote,
        // Serialização segura do Pacote (CORRIGINDO o erro de 'toISOString')
        createdAt: pacote.createdAt?.toISOString() || null, 
        updatedAt: pacote.updatedAt?.toISOString() || null,
        
        // Serializa fotos
        fotos: pacote.fotos.map(f => ({
            ...f,
            createdAt: f.createdAt.toISOString(),
            updatedAt: f.updatedAt.toISOString(),
        })),
    };
    
    // 4. Serializa o Menu de forma segura
    const serializedMenu = menuDB ? {
        ...menuDB,
        // Usamos 'as any' para forçar a serialização das datas no menu, 
        // resolvendo o erro de tipagem 'createdAt does not exist' se o seu tipo MenuItem não o incluir.
        createdAt: (menuDB as any).createdAt?.toISOString() || null, 
        updatedAt: (menuDB as any).updatedAt?.toISOString() || null,
    } : null;

    return { 
        props: { pacote: serializedPacote, menu: serializedMenu }, 
        revalidate: 60 
    };
};