import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
    title: "GymDesk",
    description: "Gym Management System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <body>
                <AppShell>
                    {children}
                </AppShell>
            </body>
        </html>
    );
}