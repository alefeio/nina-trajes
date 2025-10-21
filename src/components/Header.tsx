// src/components/AboutSection.tsx

import { useState } from "react";
import Image from "next/image";

const benefits = [
    {
        q: "Qualidade e Conforto Garantidos",
        a: [
            "Frota de veículos modernos com ar condicionado e Wi-Fi.",
            "Roteiros planejados para otimizar seu tempo e garantir a melhor experiência.",
            "Seleção de pousadas e hotéis que priorizam seu bem-estar."
        ]
    },
    {
        q: "Sua Segurança em Primeiro Lugar",
        a: [
            "Guias experientes e credenciados, garantindo sua total segurança.",
            "Agência credenciada e com anos de experiência no mercado de turismo.",
            "Suporte completo 24/7 antes, durante e depois da sua viagem."
        ]
    },
    {
        q: "Experiências para a Família",
        a: [
            "Pacotes de viagem completos e seguros para todas as idades.",
            "Criamos roteiros que fortalecem laços e geram boas recordações.",
            "Planejamos cada detalhe para atender às necessidades de crianças e adultos."
        ]
    },
    {
        q: "O Melhor Custo-Benefício",
        a: [
            "Pacotes completos com transporte, hospedagem e passeios inclusos.",
            "Preços competitivos e transparentes, para você viajar sem surpresas.",
            "Opções de pagamento flexíveis para facilitar a realização do seu sonho."
        ]
    }
];

export default function AboutSection() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section id="sobre" className="py-32 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Título Principal */}
                <div className="mb-12 text-center">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight text-pink-900  ">
                        Na Nina Trajes, a elegância vai até você. 👗✨
                    </h2>
                    <p className="text-neutral-700 max-w-7xl mx-auto text-lg px-4">
                        Somos uma loja de aluguéis de vestidos com atendimento delivery, criada para transformar a experiência de escolher o look perfeito. Você seleciona seus modelos preferidos, e nós levamos até sua casa vestidos para você experimentar com tranquilidade e escolher o que mais combina com você.
                    </p>
                    <p className="text-neutral-700 max-w-7xl mx-auto text-lg px-4">
                        Atendemos as cidades de Belém e Barcarena também, oferecendo uma variedade de opções para festas, casamentos, formaturas e eventos especiais.*
                    </p>
                    <p className="text-neutral-700 max-w-7xl mx-auto text-lg px-4">
                        Sinta-se linda, confiante e pronta para brilhar — sem precisar sair de casa.
                    </p>
                    <p className="text-neutral-700 max-w-7xl mx-auto text-lg px-4">
                        <small>
                            (*Serviço de experimentação disponível só em Belém).
                        </small>
                    </p>
                </div>
            </div>
        </section>
    );
}