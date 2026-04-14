package MadhavMathur.ExpenseHub.controller;


@RestController
@RequestMapping({"/staus", "/health"})

public class HomeController 
{
    @GetMapping
    public String healthCheck()  
    {
        return "Application is running fine";
    }

}
