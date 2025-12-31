'use client';
import { generateOrganicPath } from '@/lib/elements';
import styles from './ElementsLayer.module.css';

export default function ElementsLayer() {
    // Static paths for robustness, in a real app could be dynamic or memoized calculation
    return (
        <div className={styles.layer}>
            <svg className={styles.svg} viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EAF6F2" fillOpacity="0.5" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            {/* Additional decorative elements could go here */}
        </div>
    );
}
