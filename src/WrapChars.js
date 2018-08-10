
class WrapChars
{
    constructor()
    {

    }


    static wrap(element, type='letter', el='span', className)
    {
        let delimiter = type==='word' ? ' ' : '';

        let text  = element.textContent,
            chars = text.split(delimiter),
            rslt  = [];

        for(let char=0; char<chars.length; char++)
        {
            let str = '';
            let letter = chars[char]===' ' ? '&ensp;' : chars[char];
            str += `<${el}`;
            if(className && typeof className==='string') str += ` class="${className}"`;
            str += '>' + letter + `</${el}>`;
            rslt.push(str);
        }

        element.innerHTML = rslt.join(delimiter);

        return element;
    }
}
