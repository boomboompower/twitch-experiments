import {Alert} from '../components/Alert';
import {TabGroup} from '../components/TabGroup';
import {ActionBar} from '../components/ActionBar';
import {Footer} from '../components/Footer';

// Want to see this on the actual website itself?
// Execute this code on the console:
// localStorage.setItem('twilight.force-benchmarking-tools', 'true');
export function HomePage() {
    return (
        <div className="h-screen w-full m-auto justify-center">
            <div className="w-full m-auto max-w-4xl px-4 pt-8">
                <header aria-label={'TECG - Experiment Cookie Generator'}>
                    <h1 className="text-3xl font-bold text-white">
                        <span className='block sm:hidden text-xl'>TECG - Experiment Cookie Generator</span>
                        <span
                            className='hidden sm:block text-2xl'>TECG - Streaming Service Experiment Cookie Generator</span>
                    </h1>
                </header>

                <Alert className='my-3 hidden lg:block'>
                    <p className='font-semibold'>Important Notice:</p>
                    <p>Some experimental features may violate platform policies. Misuse could result in account
                        suspensions or other penalties. ️</p>
                    <p>&#128073; See the <a href='#warning' className='underline decoration-dotted'>warning
                        below</a> for more details.</p>
                </Alert>

                <TabGroup />

                <ActionBar />
            </div>
            <Footer/>
        </div>
    );
}
