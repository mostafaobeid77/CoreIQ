import { SceneSection } from '../components/SceneSection'
import { Badge } from '../components/ui/Badge'
import { Users, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function JoinTeamSection() {
    return (
        <div className="relative z-10 perspective-container">
            {/* Visual Bridge to Footer */}
            <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-b from-transparent to-[#020202] pointer-events-none -z-10" />

            <SceneSection id="join-team" className="pb-0 lg:pb-0">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900/50 to-transparent border border-white/5 p-12 md:p-24 text-center preserve-3d">

                    <div className="relative z-10 flex flex-col items-center space-y-8 max-w-3xl mx-auto">
                        <Badge icon={Users}>Join CoreIQ</Badge>

                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-2 text-balance leading-tight">
                            Build the future of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">human performance.</span>
                        </h2>

                        <p className="text-lg text-slate-300 max-w-xl text-balance">
                            We are looking for elite trainers, nutritionists, and visionaries to help us curate the most advanced fitness intelligence database in the world.
                        </p>

                        <Link to="/join-team" className="inline-block pt-4">
                            <button className="group relative px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                                Apply Now
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </SceneSection >
        </div>
    )
}
