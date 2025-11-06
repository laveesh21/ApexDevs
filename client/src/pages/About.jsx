import './About.css';

function About() {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About ApexDevs</h1>
        <p>Empowering developers to showcase their creativity</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            ApexDevs is a platform dedicated to helping developers from all backgrounds 
            showcase their projects and connect with the global developer community. 
            We believe that every project tells a story, and every developer deserves 
            a platform to share their work.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Project Showcase</h3>
              <p>Upload and display your projects with beautiful project cards</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Smart Filtering</h3>
              <p>Filter projects by tech stack to find exactly what you're looking for</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Global Community</h3>
              <p>Connect with developers from around the world</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Get Inspired</h3>
              <p>Discover innovative projects and learn from others</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Join Us</h2>
          <p>
            Whether you're a beginner sharing your first project or an experienced 
            developer with a portfolio of work, ApexDevs is the place for you. 
            Sign up today and become part of our growing community!
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
