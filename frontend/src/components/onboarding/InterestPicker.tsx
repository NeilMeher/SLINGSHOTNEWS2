import React from 'react'

const interests = ['tech', 'fashion', 'gaming', 'finance', 'music', 'politics']

export const InterestPicker: React.FC = () => {
    return (
        <div className="flex flex-wrap gap-3">
            {interests.map((interest) => (
                <button
                    key={interest}
                    className="px-4 py-2 border-2 border-accent-yellow rounded-full text-accent-yellow font-bold hover:bg-accent-yellow hover:text-black transition-colors"
                >
                    #{interest}
                </button>
            ))}
        </div>
    )
}
