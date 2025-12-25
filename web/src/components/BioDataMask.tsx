import { motion, useScroll, useTransform } from 'framer-motion'

export function BioDataMask() {
    const { scrollYProgress } = useScroll()
    const y = useTransform(scrollYProgress, [0, 1], [0, -400])

    const dataPoints = [
        "METABOLIC_FLUX_0.84", "NEURAL_SYNAPSE_ACTIVE", "MACRO_CALIBRATION_PENDING...",
        "GENETIC_BLUEPRINT_LOADED", "TARGET_ACQUISITION: 12_DAYS", "CORE_OS_REVISION: v2.4.0",
        "INPUT_STREAMS: LIVE", "BIO_FEEDBACK_CONNECTED", "EVOLUTION_IN_PROGRESS"
    ]

    return (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] select-none overflow-hidden font-mono text-[10px] text-violet-400">
            <motion.div style={{ y }} className="grid grid-cols-4 gap-x-24 gap-y-12 whitespace-nowrap">
                {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <span>{dataPoints[i % dataPoints.length]}</span>
                        <span className="ml-8">{Math.random().toString(16).slice(2, 10)}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
