import { Toaster } from "./components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from './lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound.jsx';
import Home from './pages/Home';
import ProjectCaseStudy from './pages/ProjectCaseStudy.jsx';
import AdminLiveChat from './AdminLiveChat';


function App() {

    return (
        <QueryClientProvider client={queryClientInstance}>
            <Router>
                <Routes>
                    {/* Nouveau portfolio (src/components/portfolio) */}
                    <Route path="/" element={<Home />} />
                    <Route path="/projects/:slug" element={<ProjectCaseStudy />} />
                    <Route path="/chat" element={<AdminLiveChat />} />
                    <Route path="*" element={<PageNotFound />} />
                </Routes>
            </Router>
            <Toaster />
        </QueryClientProvider>
    )
}

export default App
