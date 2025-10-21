// src/components/Hero.tsx

import Image from "next/image";
import { useRouter } from "next/router";
import { FaWhatsapp } from 'react-icons/fa';

export default function Hero() {
  const router = useRouter();

  const handleClick = (pg: string) => {
    router.push(pg);
  };

  return (
    <>
      {/* O cabeçalho agora tem um fundo branco (bg-white) */}
      <header id="sobre" className="relative w-full py-32 flex items-center justify-center overflow-hidden bg-white text-pink-950">
        {/* O conteúdo do cabeçalho agora tem texto escuro */}
        <div className="relative z-10 max-w-xs md:max-w-7xl mx-auto px-4 text-pink-950">
          <div className="text-center">
            <h1 className="font-serif text-pink-600 text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
              Curta o Círio Fluvial com a Muiraquitã.
            </h1>

            <p className="text-xl md:text-2xl mt-4 px-2 md:px-0">
              A Nina Trajes é uma organização especializada no segmento religioso católico e com experiência há mais de 20 anos.
            </p>

            <p className="text-lg md:text-xl mt-2 px-2 md:px-0 font-light">
              Nos destacamos pela qualidade e eficácia no atendimento, a fim de garantir os melhores serviços para você, sua familia e seu grupo. Dentre os públicos que atendemos estão: agências de viagens, paróquias, dioceses e organizações religiosas.
            </p>

            {/* Botões de Ação */}
            <div className="flex flex-col md:flex-row gap-4 mt-12 justify-center">
              <a
                href="#destinos"
                className="inline-flex items-center justify-center bg-secondary-400 hover:bg-secondary-500 hover:text-white text-pink-950 rounded-full shadow-lg py-3 px-8 font-bold text-lg transition-colors duration-300 transform hover:scale-105"
                onClick={(e) => {
                  e.preventDefault();
                  const section = document.getElementById('destinos');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                aria-label="Explore nossos pacotes de viagem"
              >
                Explore Nossos Pacotes
              </a>
              <a
                href="https://wa.me/5591981149800?text=Olá! Gostaria de mais informações sobre os pacotes de viagem."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-transparent border-2 border-pink-950 hover:bg-pink-950 hover:text-white text-pink-950 rounded-full shadow-lg py-3 px-8 font-bold text-lg transition-colors duration-300 transform hover:scale-105"
                aria-label="Fale conosco pelo WhatsApp"
              >
                <FaWhatsapp className="mr-2 text-pink-950 hover:text-white" />
                Fale com nossa equipe
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* A seção de frota agora tem o fundo com a diagonal (bg-pink-950) */}
      <section id="frota" className="relative w-full py-20 md:py-32 flex items-center justify-center overflow-hidden bg-pink-950 text-white">

        {/* Imagem de fundo com opacidade e z-index -10 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/frota1.jpeg')",
            opacity: 0.7
          }}
        ></div>

        {/* Bloco de cor diagonal para o design criativo, movido para cá */}
        <div className="absolute top-0 left-0 w-4/5 h-full bg-pink-600 transform -skew-x-12 origin-top-left opacity-30"></div>
        <div className="absolute top-0 left-0 w-3/5 h-full bg-pink-700 opacity-60 transform -skew-x-12 origin-top-left opacity-30"></div>
        <div className="absolute top-0 left-0 w-2/5 h-full bg-pink-700 opacity-60 transform -skew-x-12 origin-top-left opacity-30"></div>
        <div className="absolute top-0 left-0 w-1/5 h-full bg-pink-700 opacity-60 transform -skew-x-12 origin-top-left opacity-30"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl text-white md:text-6xl text-center font-bold font-serif mb-16">
            Conforto e Segurança Garantidos
          </h2>

          <div className="flex flex-col md:flex-row items-center md:gap-12">
            {/* Bloco de Texto Principal */}
            <div className="w-full flex flex-col justify-center mb-12 md:mb-0 bg-gray-900/80 p-6 rounded-xl shadow-lg md:w-2/3">
              <h3 className="text-2xl text-white md:text-4xl mb-4 font-bold">
                Nossos ônibus são modernos e seguros, para que você tenha uma experiência inesquecível.
              </h3>
              <p className="text-base text-white mb-4">
                Com interiores modernos, assentos confortáveis e reclináveis, sua jornada será tranquila e agradável.
              </p>
              <p className="text-base text-white mb-6">
                Cada detalhe foi pensado para a sua segurança e bem-estar, para que você e sua família possam relaxar e aproveitar o trajeto.
              </p>
              <p className="text-lg text-white font-bold">
                Viaje com a Nina Trajes e descubra o que é viajar com conforto, segurança e excelência.
              </p>
            </div>

            {/* Vídeo principal */}
            <div className="relative w-full md:w-1/3 rounded-xl overflow-hidden shadow-lg mb-8 md:mb-0">
              <video
                className="w-full h-auto"
                controls
                poster="/images/frota.png"
                playsInline
              >
                <source src="/videos/frota.mp4" type="video/mp4" />
                <source src="/videos/frota.ogg" type="video/ogg" />
                Seu navegador não suporta a tag de vídeo.
              </video>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}