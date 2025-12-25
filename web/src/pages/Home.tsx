import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { PinnedSteps } from '../components/PinnedSteps'
import { Download } from '../sections/Download'
import { Features } from '../sections/Features'
import { Hero } from '../sections/Hero'
import { Particles } from '../components/Particles'
import { ScrollExperience } from '../components/ScrollExperience'
import { AuroraBackground } from '../components/AuroraBackground'

export function HomePage() {
	return (
		<>
			<NavBar />
			{/* Global Backgrounds */}
			<AuroraBackground />
			<Particles />

			<main className="relative selection:bg-violet-500/30">
				<ScrollExperience>
					<Hero />
					<Features />
					<PinnedSteps />
					<Download />
				</ScrollExperience>
			</main>
			<Footer />
		</>
	)
}
