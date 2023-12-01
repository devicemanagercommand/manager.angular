using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Angularnet6Tosetemplate.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IdentityController : ControllerBase
    {
        private readonly ILogger<DeviceController> _logger;

        public IdentityController(ILogger<DeviceController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        [Route("user/configuration")]
        public string Get()
        {
            return "{\"oAuthUrl\":\"http://localhost:44485/api\",\"environment\":\"design\"}";
        }

        [HttpPost]
        [Route("user/info")]
        public string UserInfo()
        {
            return "{ \"id\":1,\"name\":\"System\",\"userName\":\"devel\",\"mail\":\"design@gmail.com\",\"isActive\":true,\"companyId\":null,\"communeId\":1,\"lastLogin\":\"2023-01-25T16:45:00Z\",\"createDate\":\"0001-01-01T00:00:00Z\",\"roles\":[\"user\"]}";
        }

    }
}