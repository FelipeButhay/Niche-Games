SLIDER_HTML = \
"""
    <div class="slider-comp {title_} component" data-min="{min}" data-max="{max}" data-interval="{intv}">
        <span class="comp-title">{title}</span>
        <p class="comp-desc">{desc}</p>
        <div class="slider-container">
            <div class="slider" data-value="{default}"></div>
            <span class="slider-output">{default}</span>
        </div>
    </div>
"""

SLIDER_SCRIPT = \
"""
    <script>
        (function() {{
            const lerp  = (a, b, t) => a + (b - a) * t;
            const alerp = (a, b, c) => (c - a) / (b - a);
            const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
        
            const min = {min};
            const max = {max};
        
            const slider      = document.querySelector("div.{title_}  div.slider");
            const slider_outp = document.querySelector("div.{title_} span.slider-output");
            let sliding = false;

            function startSliding(event) {{sliding =  true; sliderHandler(event)}};
            function stopSliding(event)  {{sliding = false; sliderHandler(event)}};
            
            
            let default_perc = alerp(min, max, {default});
            slider.style.background = 
                    `linear-gradient(90deg, white ${{default_perc*100}}%, black ${{default_perc*100}}%)`;

            function sliderHandler(event) {{
                let value = slider.dataset.value;
                
                if (!sliding) return;
                
                let percentage = (event.clientX - slider.getBoundingClientRect().left) / slider.offsetWidth;

                value = Math.round(lerp(min, max, percentage));
                value = clamp(value, min, max);
                
                slider.dataset.value = value;
                slider_outp.textContent = value;
                
                window.config.{title_} = value;
                
                slider.style.background = 
                    `linear-gradient(90deg, white ${{percentage*100}}%, black ${{percentage*100}}%)`;
            }}
            
            slider.addEventListener("mousedown", e => {{ sliding = true;  sliderHandler(e); }});
            document.addEventListener("mouseup",   e => {{ sliding = false; sliderHandler(e); }});
            document.addEventListener("mousemove", sliderHandler);
            
        }})();
    </script>
"""

SLIDER = SLIDER_HTML + SLIDER_SCRIPT