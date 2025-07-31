import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import eventsData from '../data/events.json';
import { useNavigate } from 'react-router-dom';

export default function PosterCarousel() {
  const carouselImages = eventsData.carouselImages;
  const navigate = useNavigate();
  
  return (
    <>
    <div className='container2' style ={{backgroundColor: "#7895CB", height: '38vh', width: '100%', marginTop: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div className='container' style={{height: '33vh', width: '95%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <Swiper
          slidesPerView={3}
          spaceBetween={24}
          centeredSlides={true}
          initialSlide={2} // Start with the 3rd image (index 2)
          loop={true} // Enable continuous loop
          loopedSlides={carouselImages.length} // Number of slides to duplicate for smooth looping
          autoplay={{
            delay: 30000, // 30 seconds
            disableOnInteraction: false, // Continue autoplay after user interaction
          }}
          pagination={{ 
            clickable: true,
            dynamicBullets: true
          }}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          modules={[Pagination, Navigation, Autoplay]}
          className="mySwiper"
          style={{
            '--swiper-pagination-color': '#4A90A4',
            '--swiper-pagination-bullet-inactive-color': 'rgba(74, 144, 164, 0.4)',
            width: '100%',
            height: '100%'
          }}
        >
          {carouselImages.map((image, i) => (
            <SwiperSlide key={image.id}>
              <div 
                style={{
                  width: '100%',
                  height: '28vh', // Adjusted to fit better within container
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, opacity 0.3s ease',
                  opacity: '0.7', // Non-active slides are less opaque
                  transform: 'scale(0.85)', // Non-active slides are smaller
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                className="slide-content"
                onClick={() => navigate(`/event/${image.id}`)}
              >
                <img
                  src={image.image}
                  alt={image.alt}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Custom Navigation Buttons */}
        <div className="swiper-button-prev-custom">
          <ChevronLeft size={20} />
        </div>
        <div className="swiper-button-next-custom">
          <ChevronRight size={20} />
        </div>
      </div>
      
      <style jsx>{`
        .container2 {
          padding: 15px;
        }
        
        .container {
          position: relative;
        }
        
        .mySwiper .swiper-slide-active .slide-content {
          opacity: 1 !important;
          transform: scale(1) !important;
        }
        
        .mySwiper .swiper-pagination {
          bottom: -25px;
          position: relative;
          text-align: center;
        }
        
        .mySwiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          margin: 0 6px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .mySwiper .swiper-pagination-bullet-active {
          background: #fff;
          transform: scale(1.2);
        }
        
        /* Custom Navigation Buttons */
        .swiper-button-prev-custom,
        .swiper-button-next-custom {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 45px;
          height: 45px;
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #7895CB;
          z-index: 10;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .swiper-button-prev-custom:hover,
        .swiper-button-next-custom:hover {
          background: rgba(255, 255, 255, 1);
          border-color: rgba(255, 255, 255, 0.8);
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .swiper-button-prev-custom {
          left: 15px;
        }
        
        .swiper-button-next-custom {
          right: 15px;
        }
        
        .swiper-button-prev-custom:active,
        .swiper-button-next-custom:active {
          transform: translateY(-50%) scale(0.95);
        }
      `}</style>
      </div>
    </>
  );
}