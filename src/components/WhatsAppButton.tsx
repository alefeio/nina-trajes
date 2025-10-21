import { useRouter } from "next/router";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

export default function WhatsAppButton() {
    const router = useRouter();

    const handleClick = (pg: string) => {
        router.push(pg);
    };

    return (
        <div className="fixed flex justify-between gap-2 bottom-4 right-4 z-30">
            <a
                href="https://www.instagram.com/ninatrajes"
                target="_blank"
                rel="noopener noreferrer"
                className="z-10 bg-pink-600 text-neutral-50 hover:bg-pink-700 text-white rounded-full shadow-lg p-3 font-bold text-lg transition"
                onClick={() => handleClick('/instagram')}
            >
                <FaInstagram className="w-7 h-7 text-white" />
            </a>
            <a
                href="https://wa.me//5591983169340?text=Gostaria de mais informações sobre o aluguel de vestidos."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-neutral-50 hover:bg-green-700 text-white rounded-full shadow-lg p-3 font-bold text-lg transition"
                onClick={() => handleClick('/whatsapp')}
            >
                <FaWhatsapp className="w-7 h-7 text-white" />
            </a>
        </div>
    )
}