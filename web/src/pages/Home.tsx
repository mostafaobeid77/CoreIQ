import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { HowItWorks } from '../sections/About'
import { Download } from '../sections/Download'
import { Features } from '../sections/Features'
import { Hero } from '../sections/Hero'
import { Particles } from '../components/Particles'
import { ScrollExperience } from '../components/ScrollExperience'

export function HomePage() {
	return (
		<>
			<NavBar />
			{/* Global Backgrounds */}
			<div className="fixed inset-0 bg-slate-950 -z-20" />
			<Particles />
			<div className="fixed inset-0 bg-noise opacity-30 pointer-events-none -z-10" />

			<main className="relative selection:bg-violet-500/30">
				<ScrollExperience>
					<Hero />
					<Features />
					<HowItWorks />
					<Download />
				</ScrollExperience>
			</main>
			<Footer />
		</>
	)
}
