import React from 'react'

const regions = ['global', 'north america', 'europe', 'asia', 'latam']

export const RegionSelector: React.FC = () => {
    return (
        <div className="flex flex-col gap-2">
            {regions.map((region) => (
                <button
                    key={region}
                    className="w-full p-4 glass-card text-left font-bold hover:border-accent-blue transition-colors"
                >
                    {region} 🌍
                </button>
            ))}
        </div>
    )
}
