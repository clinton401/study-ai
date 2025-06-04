import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {  Home, BookOpen, PenTool, Brain } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for could not be found.",
}

export default function NotFound() {
  return (
    <div className="w-full    flex items-center justify-center px-4 ">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl font-bold text-purple-600 dark:text-purple-400">404</div>
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Page Not Found</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or you entered the
            wrong URL.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
         

        
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Popular pages:</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button asChild variant="ghost" className="justify-start h-auto p-3">
                <Link href="/ai-study-tools">
                  <Brain className="mr-3 h-4 w-4 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">AI Study Tools</div>
                    <div className="text-xs text-gray-500">Summarize notes & generate quizzes</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="ghost" className="justify-start h-auto p-3">
                <Link href="/writing-companion">
                  <PenTool className="mr-3 h-4 w-4 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Writing Companion</div>
                    <div className="text-xs text-gray-500">AI-powered writing assistant</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="ghost" className="justify-start h-auto p-3">
                <Link href="/features">
                  <BookOpen className="mr-3 h-4 w-4 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">All Features</div>
                    <div className="text-xs text-gray-500">Explore all AI learning tools</div>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          {/* <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Still need help?{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact support
            </Link>
          </p> */}
        </CardFooter>
      </Card>
    </div>
  )
}
