"use client"

import CardDashboardInfo from "./card-dashboard-info";
import ContentCarousel, { ContentItem } from "./categories-carrousel";

// Datos mock de juegos populares con archivos .settings
const popularGames: ContentItem[] = [
  {
    id: 1,
    title: "Valorant",
    description: "Configuración optimizada para competitivo. Mejora tu FPS y reduce el input lag.",
    image: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5bdeb8d3f6a7fc5e/5eb7cdc1b337716b659dd560/V_AGENTS_587x900_Jett.jpg",
    badge: "Popular",
    metadata: {
      settingsFile: "valorant_pro.settings",
      downloads: "1.2M",
      rating: 4.8,
      category: "FPS",
      fileSize: "2.3 KB"
    }
  },
  {
    id: 2,
    title: "CS2",
    description: "Settings profesionales para CS2. Configuración usada por jugadores de tier 1.",
    image: "https://cdn.cloudflare.steamstatic.com/apps/csgo/images/csgo_react/social/cs2.jpg",
    badge: "Trending",
    metadata: {
      settingsFile: "cs2_competitive.settings",
      downloads: "890K",
      rating: 4.9,
      category: "FPS",
      fileSize: "1.8 KB"
    }
  },
  {
    id: 3,
    title: "Fortnite",
    description: "Configuración optimizada para building y edición rápida. Maximiza tu rendimiento.",
    image: "https://cdn2.unrealengine.com/fortnite-chapter-4-season-2-mega-city-key-art-3840x2160-b35b89041a7c.jpg",
    badge: "Updated",
    metadata: {
      settingsFile: "fortnite_competitive.settings",
      downloads: "2.1M",
      rating: 4.6,
      category: "Battle Royale",
      fileSize: "3.1 KB"
    }
  },
  {
    id: 4,
    title: "League of Legends",
    description: "Configuración para mejor visibilidad y performance en ranked. Setup de pros.",
    image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg",
    badge: "Pro",
    metadata: {
      settingsFile: "lol_ranked.settings",
      downloads: "756K",
      rating: 4.7,
      category: "MOBA",
      fileSize: "2.7 KB"
    }
  },
  {
    id: 5,
    title: "Apex Legends",
    description: "Settings optimizados para movement y aim. Configuración de jugadores profesionales.",
    image: "https://media.contentapi.ea.com/content/dam/apex-legends/common/apex-section-bg.jpg.adapt.crop16x9.1023w.jpg",
    badge: "Featured",
    metadata: {
      settingsFile: "apex_pro.settings",
      downloads: "543K",
      rating: 4.5,
      category: "Battle Royale",
      fileSize: "2.9 KB"
    }
  },
  {
    id: 6,
    title: "Overwatch 2",
    description: "Configuración competitiva con ajustes de crosshair y sensibilidad optimizados.",
    image: "https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/blt5c63c9f7e0002eee/62f4613ad7f0c8057e76e4ed/OW2_KeyArt_2x1.png",
    badge: "Esports",
    metadata: {
      settingsFile: "overwatch2_comp.settings",
      downloads: "432K",
      rating: 4.4,
      category: "FPS",
      fileSize: "2.1 KB"
    }
  },
  {
    id: 7,
    title: "RocketLeague",
    description: "Camera settings y controles utilizados por campeones de RLCS. Mejora tu juego.",
    image: "https://rocketleague.media.zestyio.com/Overview-1920x1080.f1cb27a519bdb5b6ed34049a5b86e317.jpg",
    badge: "Championship",
    metadata: {
      settingsFile: "rocket_league_rlcs.settings",
      downloads: "678K",
      rating: 4.8,
      category: "Sports",
      fileSize: "1.5 KB"
    }
  },
  {
    id: 8,
    title: "Call of Duty",
    description: "Setup táctico para Warzone. FOV, audio y graphics optimizados para ventaja competitiva.",
    image: "https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/warzone/common/social-share/wz-social-share.jpg",
    badge: "Tactical",
    metadata: {
      settingsFile: "warzone_tactical.settings",
      downloads: "1.5M",
      rating: 4.6,
      category: "Battle Royale",
      fileSize: "3.4 KB"
    }
  }
];

export default function DashboardContent() {
  return (
    <ContentCarousel
      items={popularGames}
      title="🎮 Juegos Populares - Archivos de Configuración"
      showIcon={false}
      showImage={true}
      showBadge={true}
      itemsPerView="1/4"
      renderCustomContent={(item) => (
        <CardDashboardInfo
          description={item.description}
          settingsFile={item.metadata?.settingsFile}
          fileSize={item.metadata?.fileSize}
          downloads={item.metadata?.downloads}
          rating={item.metadata?.rating}
          category={item.metadata?.category}
        />
      )}
    />
  )
}
