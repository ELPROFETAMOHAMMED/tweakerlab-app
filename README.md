# TweakerLab - PC Optimization Tools

## Overview

TweakerLab is a free, open-source PC optimization platform that provides intelligent system analysis, performance monitoring, and optimization recommendations. Built with Next.js 15, React 19, and Supabase.

## Features

- **System Analysis**: Upload and parse MSInfo32 files for comprehensive system diagnostics
- **Performance Optimization**: Intelligent recommendations based on your hardware configuration
- **Real-time Monitoring**: Track system performance metrics and health
- **User Authentication**: Secure user accounts with Supabase Auth
- **Dashboard**: Intuitive interface for managing your PC optimization journey

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI**: Tailwind CSS, Radix UI, Framer Motion
- **Parsing**: Custom MSInfo32 parser for Windows system data

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tweakerlab/tweakerlab-app.git
cd tweakerlab-app
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Architecture

### Project Structure

The project follows a domain-driven design approach with clear separation of concerns:

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── onboarding/        # User onboarding flow
├── components/            # Reusable UI components
│   ├── dashboard/         # Dashboard-specific components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── ui/               # Base UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Core business logic
│   ├── auth/             # Authentication utilities
│   ├── parsers/          # MSInfo32 parsing logic
│   ├── services/         # Business services
│   └── supabase/         # Supabase client configurations
├── types/                 # TypeScript type definitions
└── constants/            # Application constants
```

### Key Components

- **Parser System**: Modular parsing system for MSInfo32 files
- **Authentication**: SSR-compatible Supabase auth with middleware
- **Dashboard**: Real-time system monitoring and optimization recommendations
- **Onboarding**: Guided setup process for new users

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Authentication powered by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)
