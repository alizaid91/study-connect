import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaFileAlt, FaBook, FaTasks } from 'react-icons/fa';

const Home = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const features = [
    {
      title: 'Past Year Papers',
      description: 'Access a comprehensive collection of previous years\' university papers to prepare effectively for your exams.',
      path: '/pyqs',
      icon: FaFileAlt
    },
    {
      title: 'Study Resources',
      description: 'Explore our library of open-source notes, e-books, and educational materials.',
      path: '/resources',
      icon: FaBook
    },
    {
      title: 'Task Management',
      description: 'Stay organized with our smart task management system for better time management.',
      path: '/tasks',
      icon: FaTasks
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-10">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {user ? 'Welcome Back!' : 'Your All-in-One Academic Companion'}
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto px-4 sm:px-0">
          {user 
            ? 'Continue your academic journey with our comprehensive platform.'
            : 'Streamline your studies with our comprehensive platform featuring past papers and smart task management.'}
        </p>
        {!user && (
          <Link to="/auth" className="btn btn-primary text-lg">
            Get Started
          </Link>
        )}
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ title, description, path, icon: FeatureIcon }, index) => (
          <Link 
            key={index} 
            to={path}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center"
          >
            <FeatureIcon className="text-primary-500 mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-3 text-center">{title}</h3>
            <p className="text-gray-600 text-center">{description}</p>
          </Link>
        ))}
      </section>

      {/* CTA Section - Only show for non-authenticated users */}
      {!user && (
        <section className="text-center py-16 bg-primary-50 rounded-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Academic Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of students who are already using Student Guide to excel in their studies.
          </p>
          <Link to="/auth" className="btn btn-primary text-lg">
            Sign Up Now
          </Link>
        </section>
      )}
    </div>
  );
};

export default Home; 