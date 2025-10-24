import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaWhatsapp, FaShareAlt, FaHeart, FaGlobe } from "react-icons/fa"; 
import React, { useState, useEffect, useCallback } from 'react';
import { PrismaClient } from '@prisma/client';
import { MenuItem, Pacote } from '../../../types'; 
import { richTextToHtml } from '../../../utils/richTextToHtml';
import Link from 'next/link';
import { MenuInterno as MenuComponent } from 'components/MenuInterno';
import Footer from 'components/Footer';

const prisma = new PrismaClient();

interface PacotePageProps {
    pacote: Pacote;
    menu: any | null; 
}

const isImage = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

export default function PacotePage({ pacote, menu }: PacotePageProps) {
    const router = useRouter();
    const canShare = typeof window !== 'undefined' && 'share' in navigator;

    const [currentLikes, setCurrentLikes] = useState(pacote.like || 0);
    
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

    // --- FUNÇÕES DE AÇÃO (LIKE, SHARE, WHATSAPP) ---
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
                    text: pacote.subtitle || "Confira este vestido!", 
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
            `Olá, tenho interesse no vestido "${pacote.title}" (${shareUrl}). Pode me dar mais informações sobre aluguel e disponibilidade?`
        );
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    }, [pacote.title, shareUrl, whatsappNumber]);
    // --- FIM FUNÇÕES DE AÇÃO ---

    // --- METATAGS SEO COMPLETO (Nina Trajes) ---
    const companyName = "Nina Trajes";
    const metaDescription = pacote.subtitle
        ? pacote.subtitle
        : `Alugue o vestido ${pacote.title} com a ${companyName}. Perfeito para sua festa ou formatura.`;

    const keywords = `${pacote.title}, vestido de festa, aluguel de vestido, ${pacote.subtitle || ''}, ${companyName}, vestidos Belém, vestidos Barcarena, ${pacote.slug}`
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0)
        .join(', ');

    const ogImageUrl = pacote.fotos[0]?.url || `${baseUrl}/images/default-dress.jpg`;
    const isOgImageVideo = pacote.fotos[0] ? !isImage(pacote.fotos[0].url) : false;
    // --- FIM METATAGS SEO COMPLETO ---

    return (
        <>
            <Head>
                <title>{pacote.title} | {companyName}: Aluguel de Vestidos de Festa</title>
                <meta name="description" content={metaDescription} />
                <meta name="keywords" content={keywords} />
                <link rel="canonical" href={shareUrl} />
                <meta name="robots" content="index, follow" />
                <meta property="og:locale" content="pt_BR" />
                <meta property="og:site_name" content={companyName} />
                <meta property="og:title" content={pacote.title} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:url" content={shareUrl} />
                <meta property="og:type" content="article" />
                
                {isOgImageVideo ? (
                    <>
                        <meta property="og:image" content={ogImageUrl.replace(/\.(mp4|mov|avi|webm)$/i, '.jpg')} />
                        <meta property="og:video" content={ogImageUrl} />
                        <meta property="og:video:type" content="video/mp4" />
                    </>
                ) : (
                    <meta property="og:image" content={ogImageUrl} />
                )}
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pacote.title} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={ogImageUrl} />
                
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": pacote.title,
                        "description": metaDescription,
                        "image": ogImageUrl,
                        "url": shareUrl,
                        "brand": {
                            "@type": "Brand",
                            "name": companyName
                        },
                        "offers": {
                            "@type": "Offer",
                            "priceCurrency": "BRL",
                            "price": "0.00", 
                            "itemCondition": "https://schema.org/UsedCondition", 
                            "availability": "https://schema.org/Inquire" , 
                            "seller": {
                                "@type": "LocalBusiness", 
                                "name": companyName
                            }
                        }
                    })
                }} />
            </Head>

            <div className="container mx-auto px-4">
                <MenuComponent menuData={menu} /> 
                
                {/* CONTAINER DE CONTEÚDO BRANCO COM PT-32 */}
                <div className="bg-white pt-28 md:pt-36 shadow-lg overflow-hidden">
                    
                    {/* FLEX CONTAINER: Mobile (Coluna), Desktop (Linha 50/50) */}
                    <div className="flex flex-col md:flex-row"> 

                        {/* LADO ESQUERDO: GALERIA DE MÍDIA (50% Desktop, 100% Mobile) */}
                        <div className="w-full md:w-1/2 relative">
                            <div className="flex flex-col gap-4 p-4"> 
                                {pacote.fotos.map((item, index) => (
                                    // Contêiner da mídia: A altura será definida pela imagem com layout="responsive"
                                    <div key={index} className="relative w-full rounded-lg overflow-hidden shadow-md">
                                        {isImage(item.url) ? (
                                            <Image
                                                src={item.url}
                                                alt={`${pacote.title} - Mídia ${index + 1}`}
                                                // Corrigido: Usando layout="responsive" para que a altura não seja cortada
                                                layout="responsive"
                                                width={1} // Proporção 1:1, mas será reajustada pela imagem real
                                                height={1} 
                                                priority={index === 0}
                                                // Removido objectFit="cover" para garantir que a imagem não seja cortada
                                            />
                                        ) : (
                                            <video 
                                                src={item.url} 
                                                // Definimos uma altura mínima para o vídeo não colapsar, mas ele se ajusta
                                                className="w-full h-auto min-h-[400px] object-cover" 
                                                controls 
                                                playsInline 
                                                preload="metadata"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* LADO DIREITO: CONTEÚDO (50% Desktop, 100% Mobile) - Sem scroll forçado */}
                        <div className="w-full md:w-1/2 bg-white p-4 md:p-8">
                            
                            <div className="pb-8">
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
                                    <h3 className="text-lg font-semibold mb-2 uppercase">Informações de Aluguel e Prova:</h3>
                                    <p className="text-base text-neutral-500 mb-4">Entre em contato via WhatsApp para confirmar a disponibilidade deste modelo e agendar sua prova delivery em Belém ou Barcarena.</p>
                                    {/* <a
                                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá, tenho interesse no vestido "${pacote.title}" (${shareUrl}). Gostaria de verificar a disponibilidade para aluguel.`)}`}
                                        onClick={handleWhatsApp}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-flex items-center justify-center gap-2 text-white bg-green-600 hover:bg-green-700 font-bold py-3 px-6 rounded-full transition-colors shadow-lg"
                                    >
                                        <FaWhatsapp size={20} className='text-white' /> Falar com {companyName}
                                    </a> */}
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
        createdAt: pacote.createdAt?.toISOString() || null, 
        updatedAt: pacote.updatedAt?.toISOString() || null,
        
        fotos: pacote.fotos.map(f => ({
            ...f,
            createdAt: f.createdAt.toISOString(),
            updatedAt: f.updatedAt.toISOString(),
        })),
    };
    
    // 4. Serializa o Menu de forma segura
    const serializedMenu = menuDB ? {
        ...menuDB,
        createdAt: (menuDB as any).createdAt?.toISOString() || null, 
        updatedAt: (menuDB as any).updatedAt?.toISOString() || null,
    } : null;

    return { 
        props: { pacote: serializedPacote, menu: serializedMenu }, 
        revalidate: 60 
    };
};