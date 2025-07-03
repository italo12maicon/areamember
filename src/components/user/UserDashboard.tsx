import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Sidebar from '../Sidebar';
import CourseCard from '../CourseCard';
import ProductCard from '../ProductCard';
import CoursePlayer from '../CoursePlayer';
import ProductPlayer from '../ProductPlayer';
import UserSettings from './UserSettings';
import ContinueWatching from './ContinueWatching';
import Resources from './Resources';
import Favorites from './Favorites';
import History from './History';
import Notifications from './Notifications';
import Support from './Support';
import HelpCenter from './HelpCenter';
import BannerCarousel from '../BannerCarousel';
import FixedNotificationBanner from '../FixedNotificationBanner';
import { Course, Product } from '../../types';

const UserDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user, logout } = useAuth();
  const { courses, products, updateUser: updateUserInData, addToWatchHistory, addNotification } = useData();

  // Apply saved theme on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        
        // Apply theme to body
        if (preferences.theme === 'light') {
          document.body.classList.add('light-theme');
        } else {
          document.body.classList.remove('light-theme');
        }
      } catch (error) {
        console.error('Error parsing user preferences:', error);
      }
    }
  }, []);

  // Optimized auto-unlock system with memoization and debouncing
  const checkAndUpdateAccess = useCallback(() => {
    if (!user) return;

    // Garantir que unlockedProducts existe
    if (!user.unlockedProducts) {
      updateUserInData(user.id, { unlockedProducts: [] });
      return;
    }

    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(user.registrationDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check for courses that should be unlocked automatically
    const coursesToUnlock = courses.filter(course => 
      course.isBlocked &&
      course.unlockAfterDays &&
      !course.manualUnlockOnly &&
      daysSinceRegistration >= course.unlockAfterDays &&
      !user.unlockedCourses.includes(course.id)
    );

    // Check for products that should be unlocked automatically
    const productsToUnlock = products.filter(product => 
      product.isBlocked &&
      product.unlockAfterDays &&
      !product.manualUnlockOnly &&
      daysSinceRegistration >= product.unlockAfterDays &&
      !user.unlockedProducts.includes(product.id)
    );

    // Check for courses that should be blocked (if they were previously unlocked but now blocked)
    const coursesToBlock = courses.filter(course => 
      course.isBlocked &&
      user.unlockedCourses.includes(course.id) &&
      (course.manualUnlockOnly || (course.unlockAfterDays && daysSinceRegistration < course.unlockAfterDays))
    );

    // Check for products that should be blocked
    const productsToBlock = products.filter(product => 
      product.isBlocked &&
      user.unlockedProducts.includes(product.id) &&
      (product.manualUnlockOnly || (product.unlockAfterDays && daysSinceRegistration < product.unlockAfterDays))
    );

    let hasChanges = false;
    let newUnlockedCourses = [...user.unlockedCourses];
    let newUnlockedProducts = [...user.unlockedProducts];

    // Unlock courses
    if (coursesToUnlock.length > 0) {
      newUnlockedCourses = [...newUnlockedCourses, ...coursesToUnlock.map(c => c.id)];
      hasChanges = true;
      
      // Send notification for unlocked courses (limit to prevent spam)
      coursesToUnlock.slice(0, 3).forEach(course => {
        const notificationId = `unlock-course-${course.id}-${user.id}-${Date.now()}`;
        addNotification({
          id: notificationId,
          userId: user.id,
          title: 'Curso Desbloqueado! 🎉',
          message: `O curso "${course.title}" foi desbloqueado e está disponível para você!`,
          type: 'success',
          read: false,
          createdAt: new Date().toISOString(),
        });
      });
    }

    // Unlock products
    if (productsToUnlock.length > 0) {
      newUnlockedProducts = [...newUnlockedProducts, ...productsToUnlock.map(p => p.id)];
      hasChanges = true;
      
      // Send notification for unlocked products (limit to prevent spam)
      productsToUnlock.slice(0, 3).forEach(product => {
        const notificationId = `unlock-product-${product.id}-${user.id}-${Date.now()}`;
        addNotification({
          id: notificationId,
          userId: user.id,
          title: 'Produto Desbloqueado! 🎉',
          message: `O produto "${product.title}" foi desbloqueado e está disponível para você!`,
          type: 'success',
          read: false,
          createdAt: new Date().toISOString(),
        });
      });
    }

    // Block courses (remove from unlocked list)
    if (coursesToBlock.length > 0) {
      newUnlockedCourses = newUnlockedCourses.filter(courseId => 
        !coursesToBlock.some(course => course.id === courseId)
      );
      hasChanges = true;
      
      // Send notification for blocked courses (limit to prevent spam)
      coursesToBlock.slice(0, 2).forEach(course => {
        const notificationId = `block-course-${course.id}-${user.id}-${Date.now()}`;
        addNotification({
          id: notificationId,
          userId: user.id,
          title: 'Acesso ao Curso Restrito',
          message: `O acesso ao curso "${course.title}" foi temporariamente restrito.`,
          type: 'warning',
          read: false,
          createdAt: new Date().toISOString(),
        });
      });
    }

    // Block products (remove from unlocked list)
    if (productsToBlock.length > 0) {
      newUnlockedProducts = newUnlockedProducts.filter(productId => 
        !productsToBlock.some(product => product.id === productId)
      );
      hasChanges = true;
      
      // Send notification for blocked products (limit to prevent spam)
      productsToBlock.slice(0, 2).forEach(product => {
        const notificationId = `block-product-${product.id}-${user.id}-${Date.now()}`;
        addNotification({
          id: notificationId,
          userId: user.id,
          title: 'Acesso ao Produto Restrito',
          message: `O acesso ao produto "${product.title}" foi temporariamente restrito.`,
          type: 'warning',
          read: false,
          createdAt: new Date().toISOString(),
        });
      });
    }

    if (hasChanges) {
      updateUserInData(user.id, { 
        unlockedCourses: newUnlockedCourses,
        unlockedProducts: newUnlockedProducts
      });
    }
  }, [user, courses, products, updateUserInData, addNotification]);

  // Debounced effect to prevent excessive updates
  useEffect(() => {
    const timeoutId = setTimeout(checkAndUpdateAccess, 1000);
    return () => clearTimeout(timeoutId);
  }, [checkAndUpdateAccess]);

  const getAvailableCourses = useCallback(() => {
    if (!user) return [];
    
    return courses.filter(course => {
      if (!course.isBlocked) return true;
      return user.unlockedCourses.includes(course.id);
    });
  }, [user, courses]);

  const getAvailableProducts = useCallback(() => {
    if (!user || !user.unlockedProducts) return [];
    
    return products.filter(product => {
      if (!product.isBlocked) return true;
      return user.unlockedProducts.includes(product.id);
    });
  }, [user, products]);

  const getBlockedCourses = useCallback(() => {
    if (!user) return [];
    
    return courses.filter(course => {
      if (!course.isBlocked) return false;
      return !user.unlockedCourses.includes(course.id);
    });
  }, [user, courses]);

  const getBlockedProducts = useCallback(() => {
    if (!user || !user.unlockedProducts) return [];
    
    return products.filter(product => {
      if (!product.isBlocked) return false;
      return !user.unlockedProducts.includes(product.id);
    });
  }, [user, products]);

  const handleCourseSelect = useCallback((course: Course) => {
    // Check if course is still accessible (real-time check)
    const isAccessible = !course.isBlocked || user?.unlockedCourses.includes(course.id);
    
    if (!isAccessible) {
      alert('Este curso não está mais disponível para você. Verifique as condições de acesso.');
      return;
    }

    setSelectedCourse(course);
    setSelectedProduct(null);
    
    // Add to watch history
    if (user) {
      const watchHistory = {
        id: `${user.id}-${course.id}`,
        userId: user.id,
        courseId: course.id,
        lastLessonId: course.lessons[0]?.id || '',
        lastWatchedAt: new Date().toISOString(),
        firstWatchedAt: new Date().toISOString(),
        watchTimeMinutes: 0,
        completedLessons: [],
      };
      
      addToWatchHistory(watchHistory);
    }
  }, [user, addToWatchHistory]);

  const handleProductSelect = useCallback((product: Product) => {
    // Check if product is still accessible (real-time check)
    const isAccessible = !product.isBlocked || user?.unlockedProducts?.includes(product.id);
    
    if (!isAccessible) {
      alert('Este produto não está mais disponível para você. Verifique as condições de acesso.');
      return;
    }

    setSelectedProduct(product);
    setSelectedCourse(null);
    
    // Add to watch history
    if (user) {
      const watchHistory = {
        id: `${user.id}-${product.id}`,
        userId: user.id,
        productId: product.id,
        lastLessonId: product.lessons[0]?.id || '',
        lastWatchedAt: new Date().toISOString(),
        firstWatchedAt: new Date().toISOString(),
        watchTimeMinutes: 0,
        completedLessons: [],
      };
      
      addToWatchHistory(watchHistory);
    }
  }, [user, addToWatchHistory]);

  const handleCourseSelectById = useCallback((courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      handleCourseSelect(course);
    }
  }, [courses, handleCourseSelect]);

  const handleProductSelectById = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      handleProductSelect(product);
    }
  }, [products, handleProductSelect]);

  const handleLogout = useCallback(() => {
    if (confirm('Tem certeza que deseja sair da área de membros?')) {
      logout();
    }
  }, [logout]);

  const renderSection = () => {
    if (selectedCourse) {
      return (
        <CoursePlayer
          course={selectedCourse}
          onBack={() => setSelectedCourse(null)}
        />
      );
    }

    if (selectedProduct) {
      return (
        <ProductPlayer
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
        />
      );
    }

    switch (activeSection) {
      case 'home':
        return (
          <div className="space-y-8">
            {/* Header com botão de logout para mobile */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Bem-vindo, {user?.name}!
                </h1>
                <p className="text-gray-400 text-sm md:text-base">Continue de onde parou ou explore novos conteúdos</p>
              </div>
              
              {/* Botão de logout para mobile quando sidebar está fechada */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-all transform hover:scale-105 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>

            {/* Fixed Notifications */}
            <FixedNotificationBanner />

            {/* Banner Carousel */}
            <BannerCarousel />

            {/* Available Courses */}
            {getAvailableCourses().length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Seus Cursos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
                  {getAvailableCourses().map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      user={user!}
                      onClick={() => handleCourseSelect(course)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Available Products */}
            {getAvailableProducts().length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Seus Produtos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
                  {getAvailableProducts().map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      user={user!}
                      onClick={() => handleProductSelect(product)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Blocked Courses - Now visible on mobile */}
            {getBlockedCourses().length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Cursos em Breve</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
                  {getBlockedCourses().map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      user={user!}
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Blocked Products */}
            {getBlockedProducts().length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Produtos em Breve</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
                  {getBlockedProducts().map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      user={user!}
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {getAvailableCourses().length === 0 && getAvailableProducts().length === 0 && (
              <div className="text-center py-8 md:py-12">
                <p className="text-gray-400 text-sm md:text-base">Nenhum conteúdo disponível no momento</p>
              </div>
            )}
          </div>
        );

      case 'courses':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Meus Conteúdos</h1>
              
              {/* Botão de logout para mobile quando sidebar está fechada */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-all transform hover:scale-105 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>
            
            {/* Courses Section */}
            {getAvailableCourses().length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Cursos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
                  {getAvailableCourses().map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      user={user!}
                      onClick={() => handleCourseSelect(course)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Products Section */}
            {getAvailableProducts().length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Produtos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
                  {getAvailableProducts().map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      user={user!}
                      onClick={() => handleProductSelect(product)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {getAvailableCourses().length === 0 && getAvailableProducts().length === 0 && (
              <div className="text-center py-8 md:py-12">
                <p className="text-gray-400 text-sm md:text-base">Nenhum conteúdo disponível no momento</p>
              </div>
            )}
          </div>
        );

      case 'continue':
        return <ContinueWatching onCourseSelect={handleCourseSelectById} onProductSelect={handleProductSelectById} />;

      case 'resources':
        return <Resources />;

      case 'favorites':
        return <Favorites onCourseSelect={handleCourseSelectById} onProductSelect={handleProductSelectById} />;

      case 'history':
        return <History />;

      case 'notifications':
        return <Notifications />;

      case 'support':
        return <Support />;

      case 'help':
        return <HelpCenter />;

      case 'settings':
        return <UserSettings />;

      default:
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Página não encontrada</h1>
          </div>
        );
    }
  };

  if (selectedCourse || selectedProduct) {
    return renderSection();
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <div className="p-4 md:p-6 lg:p-8">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;