// components/Footer.tsx
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-secondary text-foreground py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold text-accent">Fidexa</h3>
            <p className="text-muted-foreground">
              Inspiring Digital Transformation
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="#" className="hover:text-gray-300">
              <Image
                height="32"
                width="32"
                src="https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/facebook.svg"
                alt="Facebook"
              />
            </Link>

            <Link href="#" className="hover:text-gray-300">
              <Image
                height="32"
                width="32"
                src="https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/x.svg"
                alt="X"
              />
            </Link>

            <Link href="#" className="hover:text-gray-300">
              <Image
                height="32"
                width="32"
                src="https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/instagram.svg"
                alt="Instagram"
              />
            </Link>
            <Link href="#" className="hover:text-gray-300">
              <Image
                height="32"
                width="32"
                src="https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/linkedin.svg"
                alt="LinkedIn"
              />
            </Link>
          </div>
        </div>
        <div className="border-t border-muted pt-8 mt-8 text-center text-sm text-muted-foreground">
          <a href="#" className="hover:text-accent transition-colors mr-4">
            Terms & Conditions
          </a>
          <a href="#" className="hover:text-accent transition-colors">
            Privacy Policy
          </a>
          <p className="mt-4">
            © {new Date().getFullYear()} Fidexa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
