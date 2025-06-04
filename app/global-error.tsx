"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Critical Error</CardTitle>
              <CardDescription className="text-gray-600">
                A critical error occurred that crashed the application. This is usually temporary.
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center">
              <div className="space-y-2 text-sm text-gray-500">
                <p>What you can try:</p>
                <ul className="text-left space-y-1 list-disc list-inside">
                  <li>Refresh the page</li>
                  <li>Clear your browser cache</li>
                  <li>Try again in a few minutes</li>
                  <li>Contact support if the problem persists</li>
                </ul>
              </div>

              {error.digest && (
                <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                  <p className="font-medium">Error ID:</p>
                  <code className="break-all">{error.digest}</code>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <Button onClick={reset} className="w-full" variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  )
}
