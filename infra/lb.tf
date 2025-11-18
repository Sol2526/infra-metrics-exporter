# -----------------------------
# Application Load Balancer
# -----------------------------
/*resource "aws_lb" "app" {
  name               = "infra-metrics-alb"
  load_balancer_type = "application"
  internal           = false
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  tags = {
    Name = "infra-metrics-alb"
  }
}

# -----------------------------
# Target Group for ECS service
# -----------------------------
resource "aws_lb_target_group" "app" {
  name        = "infra-metrics-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    interval            = 30
    timeout             = 5
    matcher             = "200"
  }

  tags = {
    Name = "infra-metrics-tg"
  }
}

# -----------------------------
# HTTP Listener (port 80)
# -----------------------------
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
*/
