import { useContext } from "react";
import { MetContext } from "./context/metContext";

export const Seeker = () => {
  const { categories, setFilter, filter } = useContext(MetContext);

  return (
    <div className="seeker" style={{ overflowX: 'auto', display: 'flex', gap: '10px', padding: '10px 0' }}>
        <button 
            className={`btn-category ${filter === 'all' ? 'active' : ''}`} 
            onClick={() => setFilter('all')}
        >
            Todos
        </button>
        {categories.map((cat, index) => (
            <button 
                key={index} 
                className={`btn-category ${filter === cat ? 'active' : ''}`} 
                onClick={() => setFilter(cat)}
            >
                {cat}
            </button>
        ))}
    </div>
  )
}
