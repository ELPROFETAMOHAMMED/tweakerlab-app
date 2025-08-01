-- Create game_configs table for storing popular game configuration files
CREATE TABLE IF NOT EXISTS public.game_configs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    badge VARCHAR(50),
    category VARCHAR(100),
    settings_file_name VARCHAR(255) NOT NULL,
    ini_content TEXT NOT NULL, -- Content of the .ini/.settings file
    downloads_count INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    file_size VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    featured_order INTEGER DEFAULT 0, -- For ordering featured games
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_game_configs_active ON public.game_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_game_configs_category ON public.game_configs(category);
CREATE INDEX IF NOT EXISTS idx_game_configs_featured ON public.game_configs(featured_order, is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.game_configs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read game configs
CREATE POLICY "Allow public read access to game configs" ON public.game_configs
    FOR SELECT USING (is_active = true);

-- Create policy for admin users to manage game configs (assuming admin role)
CREATE POLICY "Allow admin full access to game configs" ON public.game_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profile
            WHERE profile.id = auth.uid()
            AND profile.role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_game_configs_updated_at
    BEFORE UPDATE ON public.game_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert the current mock data
INSERT INTO public.game_configs (
    title, description, image_url, badge, category, settings_file_name,
    ini_content, downloads_count, rating, file_size, featured_order
) VALUES
(
    'Valorant',
    'Configuración optimizada para competitivo. Mejora tu FPS y reduce el input lag.',
    'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5bdeb8d3f6a7fc5e/5eb7cdc1b337716b659dd560/V_AGENTS_587x900_Jett.jpg',
    'Popular',
    'FPS',
    'valorant_pro.settings',
    '[VideoSettings]
VideoMode=1920x1080
FullScreenMode=1
WindowedResolution=1920x1080
FrameRateLimit=300
VSync=0
GraphicsQuality=0
TextureQuality=0
DetailQuality=0
UIQuality=0
EffectsQuality=0
BloomQuality=0
DistortionQuality=0
ShadowQuality=0

[AudioSettings]
MasterVolume=0.5
MusicVolume=0.1
SFXVolume=0.8
VoiceVolume=0.7
AnnouncerVolume=0.6

[GameplaySettings]
MouseSensitivity=0.4
DPI=800
ShowCrosshair=1
CrosshairColor=00FF00',
    1200000,
    4.8,
    '2.3 KB',
    1
),
(
    'CS2',
    'Settings profesionales para CS2. Configuración usada por jugadores de tier 1.',
    'https://cdn.cloudflare.steamstatic.com/apps/csgo/images/csgo_react/social/cs2.jpg',
    'Trending',
    'FPS',
    'cs2_competitive.settings',
    '[Video]
resolution=1920x1080
fullscreen=1
fps_max=300
mat_vsync=0
r_dynamic=0
r_shadows=0
func_break_max_pieces=0

[Audio]
snd_musicvolume=0.0
snd_mixahead=0.025
snd_headphone_pan_exponent=2
snd_tensecondwarning_volume=0.2

[Mouse]
sensitivity=1.2
m_rawinput=1
m_customaccel=0
zoom_sensitivity_ratio_mouse=1.0

[Crosshair]
cl_crosshairsize=2
cl_crosshairdot=0
cl_crosshaircolor=1
cl_crosshairalpha=255',
    890000,
    4.9,
    '1.8 KB',
    2
),
(
    'Fortnite',
    'Configuración optimizada para building y edición rápida. Maximiza tu rendimiento.',
    'https://cdn2.unrealengine.com/fortnite-chapter-4-season-2-mega-city-key-art-3840x2160-b35b89041a7c.jpg',
    'Updated',
    'Battle Royale',
    'fortnite_competitive.settings',
    '[Display]
FullscreenMode=Fullscreen
ResolutionX=1920
ResolutionY=1080
FrameRateLimit=240.000000

[Graphics]
sg.ResolutionQuality=100
sg.ViewDistanceQuality=0
sg.ShadowQuality=0
sg.PostProcessQuality=0
sg.TextureQuality=0
sg.EffectsQuality=0
sg.FoliageQuality=0

[Input]
MouseSensitivity=0.08
MouseSensitivityY=0.08
BuildingSensitivityMultiplier=1.5
EditModeSensitivityMultiplier=1.5

[Audio]
MasterVolume=1.0
SFXVolume=0.75
MusicVolume=0.0
DialogVolume=0.5',
    2100000,
    4.6,
    '3.1 KB',
    3
),
(
    'League of Legends',
    'Configuración para mejor visibilidad y performance en ranked. Setup de pros.',
    'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg',
    'Pro',
    'MOBA',
    'lol_ranked.settings',
    '[General]
WindowMode=2
Resolution=1920x1080
CharacterInking=0
EnableTurboMode=1
FrameCapType=1
RelativeTeamColors=1

[Performance]
ShadowsEnabled=0
EffectsQuality=0
EnvironmentQuality=0
CharacterQuality=1
WaitForVerticalSync=0

[Camera]
CameraLockMode=0
ScrollSmoothingEnabled=0
SnapCameraOnRespawn=1
AutoAcquireTarget=0

[Audio]
MasterVolume=50
SfxVolume=100
MusicVolume=0
VoiceVolume=80
PingsVolume=100',
    756000,
    4.7,
    '2.7 KB',
    4
),
(
    'Apex Legends',
    'Settings optimizados para movement y aim. Configuración de jugadores profesionales.',
    'https://media.contentapi.ea.com/content/dam/apex-legends/common/apex-section-bg.jpg.adapt.crop16x9.1023w.jpg',
    'Featured',
    'Battle Royale',
    'apex_pro.settings',
    '[Video]
setting.cl_fovScale="1.7"
setting.mat_vsync="0"
setting.r_fullscreen="1"
setting.defaultres="1920"
setting.defaultresheight="1080"
setting.r_volumetricLighting="0"
setting.ssao_enabled="False"

[Audio]
setting.miles_language="english"
setting.sound_volume="0.8"
setting.sound_volume_sfx="1.0"
setting.sound_volume_music="0.1"
setting.sound_volume_dialogue="0.7"

[Mouse]
setting.mouse_sensitivity="1.5"
setting.mouse_acceleration="0"
setting.mouse_use_per_scope_sensitivity_scalars="1"',
    543000,
    4.5,
    '2.9 KB',
    5
),
(
    'Overwatch 2',
    'Configuración competitiva con ajustes de crosshair y sensibilidad optimizados.',
    'https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/blt5c63c9f7e0002eee/62f4613ad7f0c8057e76e4ed/OW2_KeyArt_2x1.png',
    'Esports',
    'FPS',
    'overwatch2_comp.settings',
    '[Render.13]
AADetail="0"
EffectsQuality="1"
GpuMemoryRestriction="0"
LightQuality="1"
ModelQuality="1"
ReflexMode="1"
ShadowDetail="0"
TextureQuality="1"

[Sound.3]
MasterVolume="80.000000"
EffectsVolume="100.000000"
MusicVolume="15.000000"
UIVolume="75.000000"
VoiceVolume="90.000000"

[Controls.1]
MouseSensitivity="5.00"
ScopedMouseSensitivity="38.00"
MouseAcceleration="0"',
    432000,
    4.4,
    '2.1 KB',
    6
),
(
    'RocketLeague',
    'Camera settings y controles utilizados por campeones de RLCS. Mejora tu juego.',
    'https://rocketleague.media.zestyio.com/Overview-1920x1080.f1cb27a519bdb5b6ed34049a5b86e317.jpg',
    'Championship',
    'Sports',
    'rocket_league_rlcs.settings',
    '[Camera]
CameraFOV=110.0
CameraDistance=270.0
CameraHeight=110.0
CameraAngle=-3.0
CameraStiffness=0.45
CameraSwivelSpeed=4.70
CameraTransitionSpeed=1.00

[Controls]
DodgeDeadzone=0.70
SteeringSensitivity=1.20
AerialSensitivity=1.20
ControllerDeadzone=0.05

[Video]
ResolutionWidth=1920
ResolutionHeight=1080
Fullscreen=True
VSync=False
MaxFPS=250

[Audio]
MasterVolume=1.0
SFXVolume=0.8
MusicVolume=0.2
UIVolume=0.6',
    678000,
    4.8,
    '2.6 KB',
    7
),
(
    'Call of Duty',
    'Setup táctico para Warzone. FOV, audio y graphics optimizados para ventaja competitiva.',
    'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/warzone/common/social-share/wz-social-share.jpg',
    'Tactical',
    'Battle Royale',
    'warzone_tactical.settings',
    '[Display]
VideoMemoryScale=0.85
RenderResolution=100
DisplayMode=Fullscreen Borderless
MonitorIndex=0
RefreshRate=240
Brightness=55
FOVType=AffectedByViewmodel
FOV=120.000000

[Graphics]
VideoQualityLevel=1
FilmGrain=0
MotionBlur=0
WeaponMotionBlur=0
ParticleQuality=Low
BulletImpacts=Essential
Tessellation=Off
TessellationNear=Off
TessellationFar=Off
ShadowMapResolution=Low

[Audio]
MasterVolume=0.90
EffectsVolume=1.00
MusicVolume=0.05
DialogueVolume=0.80
CinematicsVolume=0.30
HitmarkerSound=MW

[Mouse]
MouseSensitivity=4.50
AdsMouseSensitivity=1.00
MouseAcceleration=0.00
MouseFilteringType=0',
    1500000,
    4.6,
    '3.4 KB',
    8
);

-- Grant necessary permissions
GRANT ALL ON public.game_configs TO authenticated;
GRANT ALL ON public.game_configs TO service_role;
