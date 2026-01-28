import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { JoinTeamSection } from '../sections/JoinTeamSection'
import { Features } from '../sections/Features'
import { Hero } from '../sections/Hero'
import { Particles } from '../components/Particles'
import { BioThread } from '../components/BioThread'
import { BioDataMask } from '../components/BioDataMask'
import { ExperienceNarrative } from '../components/ExperienceNarrative'
import { SmoothScroll } from '../components/SmoothScroll'
import { AuroraBackground } from '../components/AuroraBackground'
import { PinnedSteps } from '../components/PinnedSteps'

export function HomePage() {
	return (
		<div className="relative min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
			<NavBar />
			{/* Global Backgrounds */}
			<AuroraBackground />
			<Particles />
			<BioThread />
			<BioDataMask />
			<ExperienceNarrative />

			<main className="relative selection:bg-violet-500/30">
				<SmoothScroll>
					<Hero />
					<Features />
					<PinnedSteps />
					<JoinTeamSection />
				</SmoothScroll>
			</main>
			<Footer />
		</div>
	)
}
