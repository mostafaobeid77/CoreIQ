import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { About } from '../sections/About'
import { Download } from '../sections/Download'
import { Features } from '../sections/Features'
import { Hero } from '../sections/Hero'

export function HomePage() {
	return (
		<>
			<NavBar />
			<main className="flex flex-col">
				<Hero />
				<About />
				<Features />
				<Download />
			</main>
			<Footer />
		</>
	)
}

