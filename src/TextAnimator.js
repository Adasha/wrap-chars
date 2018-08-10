// https://gist.github.com/xposedbones/75ebaef3c10060a3ee3b246166caab56
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
let _params, n, totalChars, originalNodes;

const DEFAULT_MIN_SCALE = 0.5,
      DEFAULT_MAX_SCALE = 2,
      DEFAULT_MIN_OPACITY = 0.5,
      DEFAULT_MAX_OPACITY = 1;


class TextAnimator
{

    constructor(t, params = {})
    {
        if(t instanceof HTMLElement)
        {
            if(t.children.length<1) // is text node
            {
                // create a wrapper <span>
                let h = document.createElement('span');
                // insert wrapper before target
                t.parentNode.insertBefore(h, t);
                // add the target as a child of the wrapper
                h.appendChild(t);
                // switch references
                t = h;
            }
            n = t.childNodes;
        }
        else if(t instanceof NodeList)
        {
            n = t;
        }
        else
        {
            console.log('Error: Invalid TextAnimator target');
            return;
        }
        _params = params;
        this.init();
    }


    getScaleMin()
    {
        return _params.scaleMin||DEFAULT_MIN_SCALE;
    }


    getScaleMax()
    {
        return _params.scaleMax||DEFAULT_MAX_SCALE;
    }

    getOpacityMin()
    {
        return _params.opacityMin||DEFAULT_MIN_OPACITY;
    }

    getOpacityMax()
    {
        return _params.opacityMax||DEFAULT_MAX_OPACITY;
    }







    init()
    {
        let a, l, s, d;

        totalChars = 0;
		originalNodes = [];


        for(let i=0; i<n.length; i++)
        {
			originalNodes.push({
                element: n[i],
                content: n[i].textContent
            });

            d = _params.split=='word' ? ' ' : '';
            a = n[i].textContent.split(d);
            s = '';

            for(let j=0; j<a.length; j++)
            {
				l = (a[j]===' ') ? '&ensp;' : a[j];
                s += '<span style="display: inline-block">'+l+'</span>';
            }

            n[i].innerHTML = s;

            totalChars += a.length;
        }

		this.update = this.update.bind(this);
        window.requestAnimationFrame(this.update);
    }



    update(timestamp)
    {
        let l, c,
            scale, translate, skew, opacity,
            r = 0,
			offset = timestamp/800;

        for(let i=0; i<n.length; i++)
        {
            l = n[i].childNodes;
            for(let j=0; j<l.length; j++)
            {
                c = l[j];
				scale = Math.cos((r+j)/(totalChars-1)*Math.PI*2-offset).map(-1, 1, this.getScaleMin(), this.getScaleMax());
                c.style.transform = 'scale('+scale+')';
                opacity = Math.cos((r+j)/(totalChars-1)*Math.PI*2-offset).map(-1, 1, this.getOpacityMin(), this.getOpacityMax());
                c.style.opacity = opacity;
            }
            r += l.length;
        }

		window.requestAnimationFrame(this.update);
    }


	restoreHTML()
	{
		for(let i=0; i<originalNodes.length; i++)
        {
            originalNodes[i].element.innerHTML = originalNodes[i].content;
        }

        originalNodes = null;
	}






}
