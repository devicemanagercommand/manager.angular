using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Angularnet6Tosetemplate.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConnectController : ControllerBase
    {
        private readonly ILogger<DeviceController> _logger;

        public ConnectController(ILogger<DeviceController> logger)
        {
            _logger = logger;
        }

        [HttpPost]
        [Route("token")]
        public string Token()
        {
            return "{\"isDesign\":true, \"access_token\":\"\",\"expires_in\":60,\"token_type\":\"Bearer\",\"refresh_token\":\"1FF779F538BF020A6E0D1E86BA5CDA1F318FF0106D67A12775BC7332CF501D61\",\"scope\":\"api1 offline_access openid\",\"token\":\"8xmGCF8JBkZt1hKQyyXQx15uRcAn1Dd2Fpo9u4tq/GiTf9V20BT57AGUdgd4Q2u0jtrAXMk9ON8kIhRTRIJ4j3yXVXY2Gs\u002B/3pRW9re8VRegUJ1HNtRXmUQDNbolxjqZZoflwMg9KJPsLcyzjrWnZFvz2M8Mtr8K2nFe34kUmWyFgrXE1I/UIXK1jfT/u82fO8r8aYf7YnFv\u002Bt5kJc0tL6ifwXzEBI6NLPAn5\u002Bw\u002BweJ7FF96QeS8tc48kHRCHs4OiNffyNpc/ve8QfbmGBV1UAJdBeaBlWLmWrVcT\u002B\u002BVBJGdu4qFzOgvLrpyEcOjRKmfjh361PGfSC6O8vEHIwRLrQ==\",\"tokenId\":1}";
        }

    }
}