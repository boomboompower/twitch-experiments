import {Alert} from './Alert';

/**
 * We are using this component to display the footer of the page.
 * This is used to display the information about the project as well as legal information.
 *
 * Mostly, this is also for SEO purposes.
 */
export function Footer() {
    return (
            <footer className="bg-gray-900 text-gray-400 py-8 px-4 mt-4 md:px-16 text-xs md:text-base">
            <div className="max-w-7xl mx-auto">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">About TECG - Stream Service Experiment Cookie Generator</h2>
                    <p>TECG is an open-source tool designed for developers and enthusiasts who want to explore
                        experimental features in their favorite streaming platforms. It allows users to generate and
                        manage custom cookies, potentially activating unreleased updates or testing new features that
                        might be available on some platforms.</p>

                    <ul className="list-disc list-inside">
                        <li>Generate and import custom experiment cookies for supported platforms.</li>
                        <li>Filter experiments by active, serving one, or unregistered states.</li>
                        <li>Easily copy and paste your generated cookie settings.</li>
                        <li>Explore hundreds of experimental configurations to personalize your experience.</li>
                        <li>User-friendly design, optimized for desktop and mobile use.</li>
                    </ul>

                    <Alert id='warning'>
                        <strong>Important Notice:</strong>
                        <p>Using these experimental overrides comes with some risks. Misusing this tool <span
                            className='italic'>COULD</span> result in
                            account restrictions, suspensions or other penalties depending on the platform's policies.
                            By using TECG, you acknowledge full responsibility for any actions taken.</p>
                    </Alert>

                    <p className="text-xs md:text-sm">TECG is an independent project and is not affiliated, associated, authorized,
                        endorsed by, or in any way officially connected with any specific streaming platform or service.
                        All trademarks, service marks, and company names mentioned here are the property of their
                        respective owners.</p>

                    <div className='text-center text-xs md:text-sm'>
                        <div>&copy; {new Date().getFullYear()} &#x2022; Open-source under the MIT
                            License
                        </div>
                        <div><span>Designed by </span>
                            <a href='https://github.com/boomboompower/tecg/' target='_blank'
                               rel='noopener noreferrer'>
                                <span className='text-blue-500 hover:text-blue-400'>boomboompower</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
