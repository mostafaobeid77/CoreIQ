import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { HowItWorks } from '../sections/About'
import { Download } from '../sections/Download'
import { Features } from '../sections/Features'
import { Hero } from '../sections/Hero'
import { Testimonials } from '../sections/Testimonials'

export function HomePage() {
	return (
		<>
			<NavBar />
			<main className="flex flex-col bg-noise min-h-screen overflow-x-hidden selection:bg-violet-500/30">
				<Hero />
				<Features />
				<HowItWorks />
				<Testimonials />
				<Download />
			</main>
			<Footer />
		</>
	)
}
