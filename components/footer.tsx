import { GraduationCap, Twitter, Github, Linkedin } from "lucide-react"
import Link from "next/link";


export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className=" border-t  py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">StudyAI</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Empowering students worldwide with AI-powered learning tools. Study smarter, not harder.
            </p>
            <div className="flex space-x-4">
            <a
  href="https://twitter.com/phillips464"
  target="_blank"
  rel="noopener noreferrer"
>
  <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
</a>

<a
  href="https://github.com/clinton401"
  target="_blank"
  rel="noopener noreferrer"
>
  <Github className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
</a>

<a
  href="https://www.linkedin.com/in/clinton-phillips-316a42250/"
  target="_blank"
  rel="noopener noreferrer"
>
  <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
</a>

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/writing-companion" className="hover:text-white transition-colors">
                  Writing Companion
                </Link>
              </li>
              <li>
                <Link href="/content-generator" className="hover:text-white transition-colors">
                  Content Generator
                </Link>
              </li>
            </ul>
          </div>

          </div>

        <div className=" pt-4 text-center text-gray-400">
          <p>&copy; {year} StudyAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
