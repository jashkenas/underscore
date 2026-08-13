export function getTogglingfunction() {
    if (arguments.length == 0) {
        function inner(input) {
            return !input;
        }
        return inner;
    } else if (arguments.length != 1) {
        var args = arguments;
        function inner(input){
            let all_arguments = Array.from(args);
            all_arguments_length = all_arguments.length;
            index = all_arguments.indexOf(input);
            return all_arguments[(index + 1) % all_arguments_length];
        }
        return inner
    } else if (arguments[0] instanceof Array){
        args = arguments[0];
        function inner(input){
            let all_arguments = args;
            all_arguments_length = all_arguments.length;
            index = all_arguments.indexOf(input);
            return all_arguments[(index + 1) % all_arguments_length];
        }
        return inner   
    } else {
        obj = arguments[0];
        function inner(input) {
            inner_obj = obj;
            return inner_obj[input];
        }
        return inner
    }
}