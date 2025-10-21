import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FaWhatsapp, FaShareAlt, FaHeart, FaPlayCircle } from "react-icons/fa";
// Removido: import { format } from 'date-fns';
// Removido: import { ptBR } from 'date-fns/locale';
import { Destino, Pacote } from "../types";
import Image from "next/image";

type GallerySectionProps = {
    destino: Destino;
    onOpenModal: (pacoteId: string) => void;
    buttonHref: string;
};

// **Nova função para verificar se a URL é de um vídeo**
const isVideo = (url: string) => {
    return url.includes('/video/') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm');
};

export function GallerySection({ destino, onOpenModal, buttonHref }: GallerySectionProps) {
    const [canShare, setCanShare] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [originUrl, setOriginUrl] = useState('');
    const [pacoteStats, setPacoteStats] = useState<{ [key: string]: { like: number | null; view: number | null } }>({});

    // Removido: formatPrice não é mais necessário sem o price_card e price
    const formatPrice = useCallback((priceInCents: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
        }).format(priceInCents / 100);
    }, []);

    // **FUNÇÃO: Lida com a visualização do pacote e atualiza o estado**
    const handleView = useCallback(async (pacoteId: string) => {
        try {
            const response = await fetch('/api/stats/item-view', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pacoteId }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro na API de visualização:', response.status, errorText);
                return;
            }
            const data = await response.json();
            if (data.success) {
                // Atualiza o estado local com o novo número de visualizações
                setPacoteStats(prevStats => ({
                    ...prevStats,
                    [data.pacote.id]: {
                        ...prevStats[data.pacote.id],
                        view: data.pacote.view
                    }
                }));
            }
        } catch (error) {
            console.error('Falha ao registrar visualização:', error);
        }
    }, []);

    // **FUNÇÃO: Lida com o clique no item da galeria**
    const handleItemClick = useCallback((pacoteId: string) => {
        handleView(pacoteId); // Primeiro, chama a função para registrar a visualização
        onOpenModal(pacoteId); // Em seguida, chama a função para abrir o modal
    }, [handleView, onOpenModal]);

    const handleLike = useCallback(async (pacoteId: string) => {
        try {
            const response = await fetch('/api/stats/pacote-like', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pacoteId }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro na API de curtida:', response.status, errorText);
                return;
            }
            const data = await response.json();
            if (data.success) {
                setPacoteStats(prevStats => ({
                    ...prevStats,
                    [data.pacote.id]: { ...prevStats[data.pacote.id], like: data.pacote.like }
                }));
            }
        } catch (error) {
            console.error('Falha ao curtir pacote:', error);
        }
    }, []);

    const handleWhatsappClick = useCallback(async (pacoteId: string) => {
        try {
            await fetch('/api/stats/pacote-whatsapp', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pacoteId }),
            });
        } catch (error) {
            console.error('Falha ao registrar clique no WhatsApp:', error);
        }
    }, []);

    const handleShareClick = useCallback(async (pacoteId: string) => {
        try {
            await fetch('/api/stats/pacote-shared', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pacoteId }),
            });
        } catch (error) {
            console.error('Falha ao registrar compartilhamento:', error);
        }
    }, []);

    const handleShare = async (pacote: Pacote, shareUrl: string) => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            await navigator.share({
                title: `Pacote: ${pacote.title}`,
                text: `${pacote.subtitle ? pacote.subtitle + ' - ' : ''}Confira este pacote incrível!`,
                url: shareUrl,
            });
            await handleShareClick(pacote.id);
        } catch (error) {
            console.error('Falha ao compartilhar:', error);
        } finally {
            setIsSharing(false);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOriginUrl(window.location.origin);
            if ('share' in navigator) {
                setCanShare(true);
            }
        }
        const initialStats = destino.pacotes.reduce((acc, pacote) => {
            acc[pacote.id] = { like: pacote.like ?? 0, view: pacote.view ?? 0 };
            return acc;
        }, {} as { [key: string]: { like: number | null; view: number | null } });
        setPacoteStats(initialStats);
    }, [destino]);

    if (!destino) {
        return <p className="text-center py-8">Destino não encontrado.</p>;
    }

    const backgroundImage = destino.image || '/placeholder.jpg';

    // Removido: pacotesComDatasFuturas e sua lógica de filtragem
    const pacotesDisponiveis = destino.pacotes;

    return (
        <article className="py-8 bg-">
            <div className="relative w-full pt-20 pb-80 overflow-hidden">
                <div id="colecao">&nbsp;</div>
                {isVideo(backgroundImage) ? (
                    <video
                        src={backgroundImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute w-full h-full object-cover"
                        aria-label={`Vídeo de fundo para ${destino.title}`}
                    />
                ) : (
                    <Image
                        src={backgroundImage}
                        alt={`Background para ${destino.title}`}
                        layout="fill"
                        objectFit="cover"
                        className="absolute w-full h-full object-cover"
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-pink-100 to-pink-100/0 backdrop-blur-xs z-0"></div>

                <div className="relative z-10 flex flex-col justify-center items-center h-full text-center md:mt-16">
                    <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 rounded-xl text-pink-900 px-4 py-2  ">
                        {destino.title}
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-900 max-w-2xl px-4  ">
                        {destino.subtitle}
                    </p>
                    {destino.description?.html && (
                        <div
                            className="text-white text-md mt-4 max-w-2xl px-4  "
                            dangerouslySetInnerHTML={{ __html: destino.description.html }}
                        />
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 md:px-4 mt-[-16rem]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-8">
                    {/* Alterado de pacotesComDatasFuturas para pacotesDisponiveis */}
                    {pacotesDisponiveis.map(pacote => {
                        const shareUrl = `${originUrl}/pacotes/${destino.slug}/${pacote.slug}`;
                        const firstMedia = pacote.fotos[0] || { url: '/placeholder.jpg' };
                        const isFirstMediaVideo = isVideo(firstMedia.url);
                        // Usa o estado local para as visualizações, com fallback para o valor inicial
                        const currentLikes = pacoteStats[pacote.id]?.like ?? pacote.like ?? 0;
                        const currentViews = pacoteStats[pacote.id]?.view ?? pacote.view ?? 0;

                        return (
                            <div
                                key={pacote.id}
                                className="z-20 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer"
                                onClick={() => handleItemClick(pacote.id)}
                            >
                                <div className="flex flex-col sm:flex-row h-full">
                                    <div className="relative w-full h-[36rem] sm:w-2/3">
                                        {isFirstMediaVideo ? (
                                            <>
                                                <video
                                                    src={firstMedia.url}
                                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                                    muted
                                                    playsInline
                                                    loop
                                                    aria-label={`Vídeo do pacote ${pacote.title}`}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition-opacity opacity-0 hover:opacity-100 focus-within:opacity-100">
                                                    <FaPlayCircle className="w-16 h-16 text-white" aria-hidden="true" />
                                                </div>
                                            </>
                                        ) : (
                                            <Image
                                                src={firstMedia.url}
                                                alt={`${pacote.title}`}
                                                layout="fill"
                                                objectFit="cover"
                                                className="transition-transform duration-500 hover:scale-105"
                                            />
                                        )}
                                        <div className="absolute top-2 left-2 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLike(pacote.id);
                                                }}
                                                className="inline-flex items-center gap-1 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                                                aria-label="Curtir pacote"
                                            >
                                                <FaHeart className="w-5 h-5 text-red-500" />
                                                {currentLikes > 0 && (
                                                    <span className="text-sm font-bold">{currentLikes}</span>
                                                )}
                                            </button>
                                        </div>
                                        <div className="absolute top-2 right-2 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleItemClick(pacote.id);
                                                }}
                                                className="bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                                                aria-label="Ver mais detalhes"
                                            >
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow w-full sm:w-1/3">
                                        <h3 className="font-serif text-lg md:text-2xl font-semibold mb-1 text-pink-500">{pacote.title}</h3>
                                        {pacote.subtitle && (
                                            <p className="text-sm text-neutral-600 mb-4">{pacote.subtitle}</p>
                                        )}

                                        <div className="mt-auto pt-4 border-t border-neutral-200">
                                            {/* Removido: Bloco de código JSX para exibição de preço e datas */}

                                            <div className="flex justify-between items-center gap-2">

                                                <a
                                                    href={`https://wa.me/5591983169340?text=Olá! Gostaria de mais informações sobre o vestido ${pacote.title}. Link: ${encodeURIComponent(shareUrl)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md py-3 font-bold transition-colors duration-300"
                                                    aria-label="Reservar via WhatsApp"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleWhatsappClick(pacote.id);
                                                    }}
                                                >
                                                    <FaWhatsapp className="mr-2 text-white" />
                                                    Reservar
                                                </a>
                                                {canShare && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShare(pacote, shareUrl);
                                                        }}
                                                        className="inline-flex items-center justify-center bg-blue-600 hover:bg-pink-700 text-white rounded-full shadow-md p-3 transition-colors duration-300"
                                                        aria-label="Compartilhar"
                                                        disabled={isSharing}
                                                    >
                                                        <FaShareAlt className="w-5 h-5 text-white" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </article>
    );
}